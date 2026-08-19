function applyWorkspacePackageConditions(config) {
  config.resolve = config.resolve ?? {};
  config.resolve.conditionNames = ['@lambda/source', '...'];
  return config;
}

module.exports = { applyWorkspacePackageConditions };
