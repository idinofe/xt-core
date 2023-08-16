module.exports = {
  git: {
    commitMessage: 'release: v${version}'
  },
  github: {
    release: true,
    releaseName: 'Release ${version}',
  }
}
