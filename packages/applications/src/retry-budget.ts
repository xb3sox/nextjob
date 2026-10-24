export class RetryBudget {
  private used = 0;

  constructor(private readonly history: string[] = []) {}

  spend(): void {
    this.used += 1;
  }

  canRetry(): boolean {
    return this.used < 3;
  }
}