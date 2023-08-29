module.exports = {
  git: {
    commitMessage: 'release: v${version}'
  },
  github: {
    release: false,
    releaseName: 'Release ${version}',
  }
}
