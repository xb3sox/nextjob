# NextJob Production Rollback Procedures

> **Task Reference:** T-41 (Phase 16: CI/CD & Deployment)  
> **Recovery Targets:** Recovery Point Objective ($\text{RPO} \le 15\text{ minutes}$), Recovery Time Objective ($\text{RTO} \le 4\text{ hours}$)  
> **Authority:** Aligned with `docs/TECH.md` and `docs/ROLLOUT.md`.

---

## 1. Executive Summary & Architecture Strategy

NextJob employs an immutable, versioned infrastructure architecture enabling rapid, zero-downtime rollbacks across all tiers of the stack:

| Layer | Deployment Model | Rollback Mechanism | Target Recovery Time ($\text{RTO}$) |
| :--- | :--- | :--- | :--- |
| **Web Frontend (SPA)** | Vercel Edge / Cloudflare Pages | Instant hash promotion (`vercel rollback`) | $< 30\text{ seconds}$ |
| **API Backend** | Fastify Container / Edge Workers | Blue/Green container swap & canary drain | $< 2\text{ minutes}$ |
| **Workflows & Workers** | Temporal Orchestrator | Workflow versioning & compensation sagas | $< 5\text{ minutes}$ |
| **Database** | PostgreSQL / Drizzle ORM | Backward-compatible schema & PITR recovery | $< 4\text{ hours}$ ($\text{RPO} \le 15\text{m}$) |

---

## 2. Severity Classification & Rollback Triggers

An automated or manual rollback is initiated immediately if any of the following threshold criteria are breached within 15 minutes of deployment:

| Severity | Criteria / Triggers | Action Authority | Response SLA |
| :--- | :--- | :--- | :--- |
| **SEV-0 (Critical)** | Core application state machine blocked; data corruption risk; security exploit; complete outage. | Any On-Call Engineer / Automated Sentinel | Immediate rollback ($< 2\text{ min}$) |
| **SEV-1 (High)** | HTTP 5xx error rate $> 1.0\%$; P99 latency $> 1500\text{ms}$; AI gateway failure rate $> 2\%$. | Tech Lead or On-Call Engineer | Rollback within $15\text{ min}$ |
| **SEV-2 (Medium)** | Non-blocking UI defect; third-party connector degraded; analytics event drop. | Release Owner | Fast-forward fix or scheduled revert |

---

## 3. Tier-Specific Rollback Procedures

### 3.1 Web Frontend Rollback (Vite SPA)

Because the client web application is compiled into immutable hashed static bundles, rollbacks are atomic and instantaneous.

#### Procedure:
1. **Identify Previous Stable Deployment:**
   ```bash
   vercel deployment ls --prod
   ```
2. **Execute Instant Rollback:**
   ```bash
   vercel rollback <previous-deployment-url-or-id>
   ```
3. **Purge Edge CDN Cache (if required):**
   ```bash
   # Edge nodes automatically invalidate via unique hash, but purge can be forced:
   vercel cache purge
   ```
4. **Verification:**
   - Confirm HTTP 200 on landing, login, and application tracker routes.
   - Inspect Datadog / Sentry for client-side JavaScript error drop.

---

### 3.2 API Backend Rollback (Fastify Modular Monolith)

API services are deployed using Blue/Green container targets behind application load balancers.

#### Procedure:
1. **Switch Routing to Inactive Stable Target (Green $\rightarrow$ Blue):**
   ```bash
   aws elbv2 modify-listener --listener-arn <API_LISTENER_ARN> \
     --default-actions Type=forward,TargetGroupArn=<PREVIOUS_STABLE_TG_ARN>
   ```
2. **Drain Defective Containers:**
   - Set deregistration delay to 30 seconds to allow in-flight HTTP requests to complete.
   - Prevent new traffic from reaching the defective release.
3. **Verification:**
   - Verify health checks: `curl -f https://api.nextjob.ai/health`.
   - Confirm 5xx errors return to baseline ($< 0.05\%$).

---

### 3.3 Workers & Background Workflows Rollback (Temporal)

Temporal workflows maintain persistent state across days and weeks. Rollbacks must never corrupt in-flight workflow histories.

#### Procedure:
1. **Workflow Determinism & Versioning:**
   - Workflows use `workflow.GetVersion(changeId, minSupported, maxSupported)` to branch code paths safely between versions.
   - Never remove older code paths while workflows of that version remain open.
2. **Drain Defective Worker Task Queues:**
   - Stop dispatching new workflows to the defective worker build:
     ```bash
     temporal task-queue describe --task-queue nextjob-main-queue
     ```
   - Spin up worker nodes pinned to the prior release image.
3. **Execute Compensation Activities (Saga Pattern):**
   - If an activity failed mid-submission, the state machine triggers compensation activities (`reconcileApplicationFailure`, `releaseLockedResources`) rather than hard-failing in an undefined state.
4. **Verification:**
   - Confirm Temporal web dashboard shows zero non-deterministic history errors.

---

### 3.4 Database Rollback Procedures (PostgreSQL & Drizzle)

Database rollbacks require strict operational discipline to prevent data loss.

#### Rule: The Expand / Contract Migration Contract
- **Expand Phase (N):** All schema changes are additive only (add nullable columns, add new tables, add non-blocking indexes). Never rename or drop columns.
- **Contract Phase (N+1):** Column deprecations and removals only happen in subsequent releases once old application versions have ceased running.

#### Scenario A: Reverting an Additive Migration (Code-Only Rollback)
- Because all migrations are backward-compatible, rolling back API/Web code to the previous release requires **zero database rollback**. The previous code ignores the newly added columns.

#### Scenario B: Point-in-Time Recovery (PITR) for Data Corruption
If catastrophic data corruption occurs:
1. **Declare Maintenance Window:**
   - Activate maintenance mode banner in Cloudflare Edge Worker.
2. **Locate Target Recovery Timestamp:**
   - Identify exact timestamp $T_{\text{incident}}$ immediately prior to the corrupting event.
3. **Execute PITR Recovery:**
   ```bash
   # Restore RDS instance to target point in time (RPO <= 15 minutes guaranteed via continuous WAL archiving)
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance-identifier nextjob-prod-db \
     --target-db-instance-identifier nextjob-prod-db-recovery \
     --restore-time $(date -u -d "$T_incident" +"%Y-%m-%dT%H:%M:%SZ")
   ```
4. **Validate Data Integrity & Swop Endpoint:**
   - Run verification queries on `users`, `career_claims`, and `applications`.
   - Update database connection pool DNS or Secret reference to point to recovered database.
5. **Recovery SLA:**
   - Verified Recovery Point Objective: $\text{RPO} \le 15\text{ minutes}$.
   - Verified Recovery Time Objective: $\text{RTO} \le 4\text{ hours}$.

---

## 4. Post-Rollback Verification Checklist

- [ ] All HTTP endpoints returning 200 OK (`/`, `/login`, `/dashboard`, `/health`).
- [ ] Error tracking (Sentry) resolved back to baseline.
- [ ] Temporal workflow execution latency and queue backlogs normal.
- [ ] Database replication lag $< 1\text{ second}$.
- [ ] Status page updated with incident resolution notice.
- [ ] Post-mortem issue opened within 24 hours (Root Cause Analysis + Action Items).
