import { readFileSync, existsSync } from 'fs';
import * as yaml from 'js-yaml';
import { merge } from 'lodash';
import { join } from 'path';

const YAML_CONFIG_FILENAME = 'bootstrap';
const YAML_CONFIG_SUFFIX = 'yaml';

/**
 * use local or use nacos
 */
export default () => {
  const cwd = process.cwd();
  let config: Record<string, any> = null;

  // load config.yaml
  const commonCfgPath = join(
    cwd,
    `${YAML_CONFIG_FILENAME}.${YAML_CONFIG_SUFFIX}`,
  );
  if (existsSync(commonCfgPath))
    config = yaml.load(readFileSync(commonCfgPath, 'utf8'));

  // load config-${NODE_ENV}.yaml, like config-dev.yaml
  const envCfgPath = join(
    cwd,
    `${YAML_CONFIG_FILENAME}-${process.env.NODE_ENV}.${YAML_CONFIG_SUFFIX}`,
  );
  if (existsSync(envCfgPath)) {
    merge(config, yaml.load(readFileSync(envCfgPath, 'utf8')));
  }

  return config;
};
