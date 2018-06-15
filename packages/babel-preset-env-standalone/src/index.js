/* global VERSION */

import { registerPreset } from "@gerhobbelt/babel-standalone";
import babelPresetEnv from "@gerhobbelt/babel-preset-env";

registerPreset("env", babelPresetEnv);

export const version = VERSION;
