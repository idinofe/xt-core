const assert = require('assert').strict
const { isEncodeURILike } = require('../dist/cjs/common')

/**
 * isEncodeURILike
 */
const mockDatas = [
  [
    'https://www.baidu.com',
    'https://www.baidu.com/path/to/app',
    'www.baidu.com/path/to/app',
    'www.baidu.com/',
    'www.baidu.com',
    'baidu.com'
  ],
  [
    'https%3A%2F%2Fwww.baidu.com',
    'www.baidu.com%2Fpath%2Fto%2Fapp',
    'baidu.com%2F'
  ]
]

// 正常 url
mockDatas[0].forEach(i => {
  assert.deepEqual(
    isEncodeURILike(i),
    false
  )
})

// 编码过的 url
mockDatas[1].forEach(i => {
  assert.deepEqual(
    isEncodeURILike(i),
    true
  )
})
