function applyWorkspacePackageConditions(config) {
  config.resolve = config.resolve ?? {};
  config.resolve.conditionNames = ['@lambda/source', '...'];
  config.resolve.extensionAlias = {
    '.js': ['.ts', '.tsx', '.js'],
  };
  return config;
}

module.exports = { applyWorkspacePackageConditions };
