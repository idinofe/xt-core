// This craco dependency intened to sovle this problem: https://github.com/facebook/create-react-app/issues/11889#issuecomment-1114928008
// once create-react-app fixed that issue, craco should remove
module.exports = {
  webpack: {
    configure: (config) => {
      // ...
      const fileLoaderRule = getFileLoaderRule(config.module.rules);
      if (!fileLoaderRule) {
        throw new Error("File loader not found");
      }
      fileLoaderRule.exclude.push(/\.cjs$/);
      // ...
      return config;
    },
  },
};

function getFileLoaderRule(rules) {
  for (const rule of rules) {
    if ("oneOf" in rule) {
      const found = getFileLoaderRule(rule.oneOf);
      if (found) {
        return found;
      }
    } else if (rule.test === undefined && rule.type === "asset/resource") {
      return rule;
    }
  }
}
