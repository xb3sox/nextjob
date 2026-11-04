import RNSlider from "@react-native-community/slider";
import { withUniwind } from "uniwind";

import type { SliderProps } from "@react-native-community/slider";
import type { ComponentType } from "react";

type ThemedSliderProps = SliderProps & {
  className?: string;
  minimumTrackTintColorClassName?: string;
  maximumTrackTintColorClassName?: string;
  thumbTintColorClassName?: string;
};

const Slider = withUniwind(
  RNSlider as ComponentType<ThemedSliderProps>,
) as ComponentType<ThemedSliderProps>;

export { Slider };
