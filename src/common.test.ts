import Big from "big.js"
import { delay, divide, floatDivide, floatMultiply, genMessageId, isEncodeURILike, isFormData, isFunction, isNormalObject, isNumber, isPromise, minus, multiply, plus, promisify, randomNumber, toNonExponential, isValidToken, isString, isUrlLike, isBlobUrlLike, isDef, isUndef, isStartWithSlash, isEndWithSlash, noop, getQuery, runWithTimeout, runWithDelayedLoading } from "./common"

describe('isNumber', () => {
  it('normal case', () => {
    [1, 100, Infinity].forEach(i => {
      expect(isNumber(i)).toEqual(true)
    })
  })
  it('error case', () => {
    ['aa', '11', true, false, null, undefined, Symbol(), {}].forEach(i => {
      expect(isNumber(i)).toEqual(false)
    })
  })
})

describe('isString', () => {
  it('normal case', () => {
    ['aaa',''].forEach(i=>{
      expect(isString(i)).toEqual(true)
    })
  })
  it('error case', () => {
    [true].forEach(i=>{
      expect(isString(i)).toEqual(false)
    })
  })
})

describe('promisify', () => {
  it('normal case', () => {
    expect(isPromise(promisify(1113151))).toEqual(true)
    expect(isPromise(promisify('foo bar'))).toEqual(true)
    expect(isPromise(promisify(true))).toEqual(true)
    expect(isPromise(promisify(false))).toEqual(true)
    expect(isPromise(promisify(undefined))).toEqual(true)
    expect(isPromise(promisify(null))).toEqual(true)
    expect(isPromise(promisify(Symbol()))).toEqual(true)
    expect(isPromise(promisify({}))).toEqual(true)
    expect(isPromise(promisify(new Date()))).toEqual(true)
    expect(isPromise(promisify(() => {}))).toEqual(true)
    expect(isPromise(promisify(Promise.resolve()))).toEqual(true)
    let p1 = Promise.resolve('p1')
    expect(promisify(p1)).toEqual(p1)
  })
  it('resolve values are the same', () => {
    let p1 = Promise.resolve('p1')

    return Promise.all([
      promisify(145635672).then(a => {
        expect(a).toEqual(145635672)
      }),
      promisify('foo').then(a => {
        expect(a).toEqual('foo')
      }),
      promisify(true).then(a => {
        expect(a).toEqual(true)
      }),
      promisify(false).then(a => {
        expect(a).toEqual(false)
      }),
      promisify(undefined).then(a => {
        expect(a).toEqual(undefined)
      }),
      promisify(null).then(a => {
        expect(a).toEqual(null)
      }),
      promisify(Symbol('foo')).then(a => {
        expect(a.toString()).toEqual('Symbol(foo)')
      }),
      promisify({}).then(a => {
        expect(JSON.stringify(a)).toEqual(JSON.stringify({}))
      }),
      promisify(new Date()).then(a => {
        expect(Object.prototype.toString.call(a)).toEqual('[object Date]')
      }),
      promisify(p1).then(a => {
        expect(a).toEqual('p1')
      })
    ])
  })
  it('promise function', () => {
    let fn1 = () => Promise.resolve('fn1')
    let fn2 = async () => {
      throw new Error('error')
    }

    return Promise.all([
      promisify(fn1).then(a => {
        expect(isFunction(a)).toEqual(true)
        a().then(b => {
          expect(b).toEqual('fn1')
        })
      }),
      promisify(fn2).then(a => {
        expect(a).toEqual(fn2)
        expect(isFunction(a)).toEqual(true)
        return a().catch(e => {
          expect(e.message).toEqual('error')
        })
        // expect(() => a()).toThrowError('error')
      })
    ])

  })
})

describe('delay', () => {
  it('normal case', () => {
    expect(isPromise(delay(100))).toEqual(true)
    expect(isPromise(delay(undefined))).toEqual(true)
  })
  it('error case', () => {
    expect(() => delay(-60)).toThrowError()
    expect(() => delay('foo bar' as any)).toThrowError()
    expect(() => delay(true as any)).toThrowError()
    expect(() => delay(false as any)).toThrowError()
    expect(() => delay(null as any)).toThrowError()
    expect(() => delay({} as any)).toThrowError()
    expect(() => delay(Symbol() as any)).toThrowError()
    expect(() => delay((() => {}) as any)).toThrowError()
  })
})

describe('noop', () => {
  it('noop should be a function', () => {
    expect(isFunction(noop)).toEqual(true)
  })

  it('when called no value returned', () => {
    expect(noop()).toEqual(undefined)
  })
})

describe('randomNumber', () => {
  it('normal case', () => {
    expect(randomNumber(0)).toHaveLength(0)
    expect(randomNumber(10)).toHaveLength(10)
    expect(randomNumber(15)).toHaveLength(15)
    expect(randomNumber(20)).toHaveLength(20)
    expect(randomNumber()).toHaveLength(20)
    expect(randomNumber(100)).toHaveLength(100)
    expect(randomNumber(1000)).toHaveLength(1000)
  })
  it('error case', () => {
    expect(() => randomNumber(-1)).toThrowError('len must great than -1')
    expect(() => randomNumber(undefined)).not.toThrowError('len must be a Number')
    expect(() => randomNumber(null as any)).toThrowError('len must be a Number')
    expect(() => randomNumber({} as any)).toThrowError('len must be a Number')
    expect(() => randomNumber('aaa' as any)).toThrowError('len must be a Number')
    expect(() => randomNumber('111' as any)).toThrowError('len must be a Number')
    expect(() => randomNumber(true as any)).toThrowError('len must be a Number')
    expect(() => randomNumber(Symbol() as any)).toThrowError('len must be a Number')
  })
})
// toThrowError 断言当调用函数时是否抛出错误。(必须将代码包装在一个函数中，否则错误将不会被捕获，测试将失败。)
describe('genMessageId', () => {
  beforeEach(() => {
    vi.useFakeTimers() // 启用模拟定时器（它将包装所有对计时器的进一步调用（例如Date）
  })
  afterEach(() => {
    vi.useRealTimers() // 返回使用前状态
  })
  it('normal case', () => {
    expect(() => genMessageId()).not.toThrowError()
    expect(genMessageId()).toHaveLength(21)
  })
  it('content matched to Date', () => {
    const date = new Date(2023, 6, 27)
    vi.setSystemTime(date) // 将当前日期设置为过去的日期
    expect(genMessageId().slice(0, 8)).toEqual('20230727')
    expect(genMessageId().slice(8, 16)).toEqual('00000000')
  })
})

describe('isEncodeURILike', () => {
  const mockDatas1 = [
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
  it('正常 url', () => {
    mockDatas1[0].forEach(i => {
      expect(isEncodeURILike(i)).toStrictEqual(false)
    })
  })

  it('编码过的 url', () => {
    mockDatas1[1].forEach(i => {
      expect(isEncodeURILike(i)).toStrictEqual(true)
    })
  })
})

describe('toNonExponential', () => {
  const mockDatas1 = [
    [4.496794759834739e-9, '0.000000004496794759834739',],
    [4.496794759834739e+9, '4496794759.834739'],
    [null, null],
    ['aaa', 'aaa'],
    [' ', ' '],
    [{}, {}],
    [undefined, undefined],
    [true, true],
    [false, false]
  ]
  it('normal', () => {
    mockDatas1.forEach((pair) => {
      expect(toNonExponential(pair[0] as any)).toEqual(pair[1])
    })
  })
})

describe('floatMultiply', () => {
  it(' 1 * 100 = 100', () => {
    expect(floatMultiply(1, 100)).toEqual(100)
  })

  it('0.7 * 100 = 70.00', () => {
    expect(floatMultiply(0.7, 100)).toEqual(70)
  })

  it('19.9 * 100 = 1990', () => {
    expect(floatMultiply(19.9, 100)).toEqual(1990)
  })

  it('1306377.64 * 100 = 130637764', () => {
    expect(floatMultiply(1306377.64, 100)).toEqual(130637764)
  })

  it('1306377.64 * 10 * 10 equasl 130637764', () => {
    expect( floatMultiply(floatMultiply(1306377.64, 10) as number, 10)).toEqual(130637764)
  })

  it('0.7 * 180 = 126', () => {
    expect(floatMultiply(0.7, 180)).toEqual(126)
  })

  it('9.7 * 100 = 970', () => {
    expect(floatMultiply(9.7, 100)).toEqual(970)
  })

  it('39.7 * 100 = 3970', () => {
    expect(floatMultiply(39.7, 100)).toEqual(3970)
  })

  it('0 * 0.7 = 0', () => {
    expect(floatMultiply(0, 0.7)).toEqual(0)
  })

  it('9.7 * 0 = 0', () => {
    expect(floatMultiply(9.7, 0)).toEqual(0)
  })

  it('9.7 * null = null', () => {
    expect(floatMultiply(9.7, null as any)).toEqual(null)
  })

  it('0 * null = null', () => {
    expect(floatMultiply(0, null as any)).toEqual(null)
  })
})

describe('floatDivide', () => {
  it ('100 / 100 = 1', () => {
    expect(floatDivide(100, 100)).toEqual(1)
  })

  // in JS：0.7/100=0.006999999999999999
  it('0.7 / 100 = 0.007', () => {
    expect(floatDivide(0.7, 100)).toEqual(0.007)
  })

  it('0.3 / 0.1 = 3', () => {
    expect(floatDivide(0.3, 0.1)).toEqual(3)
  })

  it('0.69 / 10 = 0.069', () => {
    expect(floatDivide(0.69, 10)).toEqual(0.069)
  })

  it('0.7 / 0 = null', () => {
    expect(floatDivide(0.7, 0)).toEqual(null)
  })

  it('0.7 / null = null', () => {
    expect(floatDivide(0.7, null as any)).toEqual(null)
  })

  it('0 / 0 = null', () => {
    expect(floatDivide(0, 0)).toEqual(null)
  })

  it('0 / 10 = 0', () => {
    expect(floatDivide(0, 10)).toEqual(0)
  })
})

describe('divide/div', () => {
  it ('100 / 100 = 1', () => {
    expect(divide(100, 100).toNumber()).toEqual(1)
  })

  // in JS：0.7/100=0.006999999999999999
  it('0.7 / 100 = 0.007', () => {
    expect(divide(0.7, 100).toNumber()).toEqual(0.007)
  })

  it('0.3 / 0.1 = 3', () => {
    expect(divide(0.3, 0.1).toNumber()).toEqual(3)
  })

  it('0.69 / 10 = 0.069', () => {
    expect(divide(0.69, 10).toNumber()).toEqual(0.069)
  })

  it('0.7 / 0 = null', () => {
    expect(() => divide(0.7, 0)).toThrowError('Division by zero')
  })

  it('0.7 / null = null', () => {
    expect(() => divide(0.7, null as any)).toThrowError('Invalid number')
  })

  it('0 / 0 = null', () => {
    expect(() => divide(0, 0)).toThrowError('Division by zero')
  })

  it('0 / 10 = 0', () => {
    expect(divide(0, 10).toNumber()).toEqual(0)
  })
})

describe('multiply/times', () => {
  it(' 1 * 100 = 100', () => {
    expect(multiply(1, 100).toNumber()).toEqual(100)
  })

  it('0.7 * 100 = 70.00', () => {
    expect(multiply(0.7, 100).toNumber()).toEqual(70)
  })

  it('19.9 * 100 = 1990', () => {
    expect(multiply(19.9, 100).toNumber()).toEqual(1990)
  })

  it('1306377.64 * 100 = 130637764', () => {
    expect(multiply(1306377.64, 100).toNumber()).toEqual(130637764)
  })

  it('1306377.64 * 10 * 10 = 130637764', () => {
    expect( multiply(multiply(1306377.64, 10), 10).toNumber()).toEqual(130637764)
  })

  it('0.7 * 180 = 126', () => {
    expect(multiply(0.7, 180).toNumber()).toEqual(126)
  })

  it('9.7 * 100 = 970', () => {
    expect(multiply(9.7, 100).toNumber()).toEqual(970)
  })

  it('39.7 * 100 = 3970', () => {
    expect(multiply(39.7, 100).toNumber()).toEqual(3970)
  })

  it('0 * 0.7 = 0', () => {
    expect(multiply(0, 0.7).toNumber()).toEqual(0)
  })

  it('9.7 * 0 = 0', () => {
    expect(multiply(9.7, 0).toNumber()).toEqual(0)
  })

  it('9.7 * null = null', () => {
    expect(() => multiply(9.7, null as any).toNumber()).toThrowError('Invalid number')
  })

  it('0 * null = null', () => {
    expect(() => multiply(0, null as any)).toThrowError('Invalid number')
  })
})

describe('plus', () => {
  it("plus(a, b) instaceOf Big", () => {
    expect(plus(1, 2)).toBeInstanceOf(Big)
  })

  it("0.1 + 0.2 = '0.3'", () => {
    expect(plus(0.1, 0.2).toFixed(1)).toEqual('0.3')
  })

  it("0.7 + 0.1 = '0.8'", () => {
    expect(plus(0.7, 0.1).toFixed(1)).toEqual('0.8')
  })

  it("0.2 + 0.4 = '0.6'", () => {
    expect(plus(0.2, 0.4).toFixed(1)).toEqual('0.6')
  })

  it("'0.1' + '0.2' = '0.3'", () => {
    expect(plus('0.1', '0.2').toFixed(1)).toEqual('0.3')
  })

  it("'0.7' + '0.1' = '0.8'", () => {
    expect(plus('0.7', '0.1').toFixed(1)).toEqual('0.8')
  })

  it("'0.2' + '0.4' = '0.6'", () => {
    expect(plus('0.2', '0.4').toFixed(1)).toEqual('0.6')
  })

  it("0.2 + 0.4 + 0.4 = '1.0'", () => {
    expect(plus(0.2, 0.4).plus(0.4).toFixed(1)).toEqual('1.0')
  })

  // error
  it("null + 0.1 throw error", () => {
    expect(() => plus(null as any, 0.1)).toThrowError("Invalid number")
  })

  it("undefined + 0.1 throw error", () => {
    expect(() => plus(undefined as any, 0.1)).toThrowError("Invalid number")
  })
})

describe('minus', () => {
  it("minus(a, b) instaceOf Big", () => {
    expect(minus(1, 2)).toBeInstanceOf(Big)
  })

  it("1.5 - 1.2 = '0.3'", () => {
    expect(minus(1.5, 1.2).toFixed(1)).toEqual('0.3')
  })

  it("0.3 - 0.2 = '0.1'", () => {
    expect(minus(0.3, 0.2).toFixed(1)).toEqual('0.1')
  })

  it("'1.5' - '1.2' = '0.3'", () => {
    expect(minus('1.5', '1.2').toFixed(1)).toEqual('0.3')
  })

  it("'0.3' - '0.2' = '0.1'", () => {
    expect(minus('0.3', '0.2').toFixed(1)).toEqual('0.1')
  })

  it("0.3 - 0.2 - 0.1 = '0.0'", () => {
    expect(minus(0.3, 0.2).minus(0.1).toFixed(1)).toEqual('0.0')
  })

  // error
  it("null - 0.1 throw error", () => {
    expect(() => minus(null as any, 0.1)).toThrowError("Invalid number")
  })

  it("undefined - 0.1 throw error", () => {
    expect(() => minus(undefined as any, 0.1)).toThrowError("Invalid number")
  })
})

describe('isFunction', () => {
  it('function', () => {
    expect(isFunction(() => {})).toEqual(true)
    expect(isFunction(function () {})).toEqual(true)
    expect(isFunction(async () => {})).toEqual(true)
  })
  it('not function', () => {
    expect(isFunction('')).toEqual(false)
    expect(isFunction(1231)).toEqual(false)
    expect(isFunction(undefined)).toEqual(false)
    expect(isFunction(undefined)).toEqual(false)
    expect(isFunction(null)).toEqual(false)
    expect(isFunction({})).toEqual(false)
  })
})

describe('isFormData', () => {
  // TODO: 怎么修复 Node.js 环境无法模拟真实的 FormData？
  it('normal case', () => {
    expect(isFormData(() => {})).toEqual(false)
    expect(isFormData(function () {})).toEqual(false)
    expect(isFormData(async () => {})).toEqual(false)
    expect(isFormData('')).toEqual(false)
    expect(isFormData(1231)).toEqual(false)
    expect(isFormData(undefined)).toEqual(false)
    expect(isFormData(undefined)).toEqual(false)
    expect(isFormData(null)).toEqual(false)
    expect(isFormData({})).toEqual(false)
  })
})

describe('isPromise', () => {
  it('promise', () => {
    expect(isPromise(new Promise((resolve) => { resolve(true) }))).toEqual(true)
    expect(isPromise(Promise.resolve())).toEqual(true)
    expect(isPromise({
      then: () => {}
    })).toEqual(true)
  })
  it('not promise', () => {
    expect(isPromise('')).toEqual(false)
    expect(isPromise(12)).toEqual(false)
    expect(isPromise(undefined)).toEqual(false)
    expect(isPromise(null)).toEqual(false)
    expect(isPromise(() => {})).toEqual(false)
    expect(isPromise({})).toEqual(false)
  })
})

describe('isNormalObject', () => {
  it('normal object', () => {
    expect(isNormalObject({})).toEqual(true)
  })
  it('not normal object', () => {
    expect(isNormalObject(() => {})).toEqual(false)
    expect(isNormalObject([])).toEqual(false)
  })
})

describe('isValidToken', () => {
  it('normal token', () => {
    expect(isValidToken('4a2886d21ff453bdf423c326d41913d1')).toEqual(true)
   })
  it('not normal token', () => {
    expect(isValidToken(0)).toEqual(false)
    expect(isValidToken('')).toEqual(false)
    expect(isValidToken(undefined)).toEqual(false)
    expect(isValidToken('null')).toEqual(false)
    expect(isValidToken('undefined')).toEqual(false)
    expect(isValidToken({token: '3243'})).toEqual(false)
    expect(isValidToken('  ')).toEqual(false)
    expect(isValidToken('[object Object]')).toEqual(false)
   })
})

describe('isDef', () => {
  it('def', () => {
    const defDataMap = {
      number: 15451,
      string_0: 'foo bar',
      string_1: 'undefined',
      string_2: 'null',
      boolean_0: true,
      boolean_1: false,
      symbol: Symbol(),
      object_0: {},
      object_1: Object.create(null),
      object_2: { foo: 'bar' },
      function_0: function () {},
      function_1: () => {},
      function_2: async function () {},
      function_3: async () => {},
    }
    const defList = Object.values(defDataMap)
    defList.forEach(item => {
      expect(isDef(item)).toEqual(true)
    })
  })
  it('undef', () => {
    expect(isDef(undefined)).toEqual(false)
    expect(isDef(null)).toEqual(false)
  })
})

describe('isUndef', () => {
  const defDataMap = {
    number: 15451,
    string_0: 'foo bar',
    string_1: 'undefined',
    string_2: 'null',
    boolean_0: true,
    boolean_1: false,
    symbol: Symbol(),
    object_0: {},
    object_1: Object.create(null),
    object_2: { foo: 'bar' },
    function_0: function () {},
    function_1: () => {},
    function_2: async function () {},
    function_3: async () => {},
  }
  it('undef', () => {
    const defList = Object.values(defDataMap)
    defList.forEach(item => {
      expect(isUndef(item)).toEqual(false)
    })
  })
  it('def', () => {
    expect(isUndef(undefined)).toEqual(true)
    expect(isUndef(null)).toEqual(true)
  })
})

describe('isStartWithSlash', () => {
  it('start with slash', () => {
    expect(isStartWithSlash('/')).toEqual(true)
    expect(isStartWithSlash('/////')).toEqual(true)
    expect(isStartWithSlash('/%@@@')).toEqual(true)
  })
  it('not start with slash', () => {
    expect(isStartWithSlash('%!!!')).toEqual(false)
    expect(isStartWithSlash('{}/')).toEqual(false)
  })
  it ('error type', () => {
    expect(() => isStartWithSlash(22 as any)).toThrowError()
    expect(() => isStartWithSlash(undefined as any)).toThrowError()
    expect(() => isStartWithSlash(null as any)).toThrowError()
    expect(() => isStartWithSlash({} as any)).toThrowError()
    expect(() => isStartWithSlash(true as any)).toThrowError()
    expect(() => isStartWithSlash(Symbol() as any)).toThrowError()
  })
})

describe('isEndWithSlash', () => {
  it('end with slash', () => {
    expect(isEndWithSlash('/')).toEqual(true)
    expect(isEndWithSlash('%@@@/')).toEqual(true)
  })
  it('not end with slash', () => {
    expect(isEndWithSlash('%!!!')).toEqual(false)
    expect(isEndWithSlash('/{}')).toEqual(false)
  })
  it ('error type', () => {
    expect(() => isEndWithSlash(22 as any)).toThrowError()
    expect(() => isEndWithSlash(undefined as any)).toThrowError()
    expect(() => isEndWithSlash(null as any)).toThrowError()
    expect(() => isEndWithSlash({} as any)).toThrowError()
    expect(() => isEndWithSlash(true as any)).toThrowError()
    expect(() => isEndWithSlash(Symbol() as any)).toThrowError()
  })
})

describe('isUrlLike', () => {
  it('normal isUrlLike', () => {
    expect(isUrlLike('http://?sdsfdg')).toEqual(true)
    expect(isUrlLike('https://ssfsg.com')).toEqual(true)
    expect(isUrlLike('https://')).toEqual(true)
  })
  it('not normal isUrlLike', () => {
    expect(isUrlLike('1232')).toEqual(false)
    expect(isUrlLike('')).toEqual(false)
  })
})

describe('isBlobUrlLike', () => {
  it('normal isBlobUrlLike', () => {
    expect(isBlobUrlLike('blob:0100111')).toEqual(true)
    expect(isBlobUrlLike('blob:787qwwwwwwwwwwwwww0100111')).toEqual(true)
  })
  it('not normal isBlobUrlLike', () => {
    expect(isBlobUrlLike('wdwdwqa')).toEqual(false)
  })
})

describe('getQuery', () => {
  it('normal getQuery', () => {
    expect(getQuery('http://wewe.com?a=11&b=22&c=33', 'a')).toEqual('11')
    expect(getQuery('http://wewe.com?a=11&b=22&c=33', 'y')).toEqual(undefined)
    expect(getQuery('https://www.baidu.com/s?ie=UTF-8&wd=%E8%AE%A2%E5%8D%95', 'wd')).toEqual('%E8%AE%A2%E5%8D%95')   
  })
  it('not normal getQuery', () => {
    expect(getQuery('http://wewe.com?a=11&b=22&c=33','b')).not.to.equal('1')
    expect(() => getQuery('', 'a')).toThrowError()
    expect(() => getQuery('http://wewe.com?a=11&b=22&c=33', '')).toThrowError()
    expect(() => getQuery('', '')).toThrowError()
  })
  it ('error type', () => {
    expect(() => getQuery('', 88 as any)).toThrowError()
    expect(() => getQuery(null as any, '')).toThrowError()
  })
})

describe('runWithTimeout', () => {
  it('normal promiseFn case', async () => {
    const promiseFn = function () {
      return new Promise((resolve)=>{
        setTimeout(()=>{
          resolve('Success')                                                                                                                                                             
        }, 2000)
      })
    }
    const result = await runWithTimeout(promiseFn, 1000)
    expect(result).toEqual({ isTimeOut: true, result: undefined })
    const result2 = await runWithTimeout(promiseFn, 3000)
    expect(result2).toEqual({ isTimeOut: false, result: 'Success' })
  })
  it('normal sync case', async () => {
    const syncFn = function () {
      return 'Success'
    }
    const syncFn100 = function() {
      const start = new Date().getTime()
      while (new Date().getTime() < start + 100) {}
      return 'Success'
    }
    const result = await runWithTimeout(syncFn, 3000)
    expect(result).toEqual({ isTimeOut: false, result: 'Success' })
    const result2 = await runWithTimeout(syncFn100, 10)
    expect(result2).toEqual({ isTimeOut: false, result: 'Success' })
    const obj = {
      name: 'test',
      fn: function (param: any) {
        return this.name + param
      }
    }
    const obj1 = {
      name: 'test this'
    }
    const result3 = await runWithTimeout(obj.fn, 10, obj1, ' orientation')
    expect(result3).toEqual({ isTimeOut: false, result: 'test this orientation' })
  })
  it ('error type', () => {
    const syncFn1 = function () {
      return 'Success'
    }
    expect(() => runWithTimeout(22 as any, 100)).toThrowError()
    expect(() => runWithTimeout(undefined as any, 100)).toThrowError()
    expect(() => runWithTimeout(null as any, 100)).toThrowError()
    expect(() => runWithTimeout({} as any, 100)).toThrowError()
    expect(() => runWithTimeout(true as any, 100)).toThrowError()
    expect(() => runWithTimeout(Symbol() as any, 100)).toThrowError()
    expect(() => runWithTimeout(true as any, 100)).toThrowError()
    expect(() => runWithTimeout(syncFn1, '1' as any)).toThrowError()
  })
})

describe("runWithDelayedLoading", () => {
  afterEach(() => {
    vi.useRealTimers()
  })
  it("should resolve immediately after delayed if task finishes before loadingDelay", async () => {
    vi.useFakeTimers()

    const mockTask = vi.fn(async () => "result")
    const onLoading = vi.fn()
    const onSettled = vi.fn()

    const promise = runWithDelayedLoading(mockTask, {
      loadingDelay: 100,
      onLoading,
      onSettled
    })

    await vi.advanceTimersByTimeAsync(50) // Task finishes before loadingDelay
    expect(onLoading).not.toHaveBeenCalled()
    expect(onSettled).not.toHaveBeenCalled()

    const result = await promise
    expect(result).toBe("result")
    expect(onLoading).not.toHaveBeenCalled()
    expect(onSettled).not.toHaveBeenCalled()
  })

  it("should show loading when task takes longer than loadingDelay", async () => {
    vi.useFakeTimers()

    const mockTask = vi.fn(() => new Promise(resolve => setTimeout(() => resolve("result"), 200)))
    const onLoading = vi.fn()
    const onSettled = vi.fn()

    const promise = runWithDelayedLoading(mockTask, {
      loadingDelay: 100,
      onLoading,
      onSettled,
      minLoadingDuration: 50
    })

    await vi.advanceTimersByTimeAsync(100) // Reach loadingDelay
    expect(onLoading).toBeCalledTimes(1)

    await vi.advanceTimersByTimeAsync(100) // Task finishes
    await vi.advanceTimersByTimeAsync(50) // Ensure minLoadingDuration is met

    const result = await promise
    expect(result).toBe("result")
    expect(onSettled).toBeCalledTimes(1)
  })

  it("should ensure loading shows for at least minLoadingDuration", async () => {
    vi.useFakeTimers()

    const mockTask = vi.fn(() => new Promise(resolve => setTimeout(() => resolve("result"), 300)))
    const onLoading = vi.fn()
    const onSettled = vi.fn()

    const promise = runWithDelayedLoading(mockTask, {
      loadingDelay: 100,
      onLoading,
      onSettled,
      minLoadingDuration: 500
    })

    await vi.advanceTimersByTimeAsync(100) // Reach loadingDelay
    expect(onLoading).toBeCalledTimes(1)
    expect(onSettled).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(200) // Task finishes (total 300ms)

    const isSettled1 = await Promise.race([
      promise.then(() => true, () => true),
      Promise.resolve(false).then(r => r),
    ])
    expect(isSettled1).toBe(false) // promise should not settle
    expect(onSettled).not.toHaveBeenCalled()

    // Should still wait additional 300ms to meet minLoadingDuration (500ms total)
    await vi.advanceTimersByTimeAsync(300)
    expect(onSettled).toBeCalledTimes(1)
    const isSettled2 = await Promise.race([
      promise.then(() => true, () => true),
      Promise.resolve(false).then(r => r),
    ])
    const result = await promise
    expect(result).toBe("result")
    expect(isSettled2).toBe(true) // promise should be settled
  })

  // this will cause vitest throw error skip temporally
  it.skip("should handle task rejection", async () => {
    vi.useFakeTimers()

    const mockTask = vi.fn().mockRejectedValue(new Error("Failed"))
    const onLoading = vi.fn()
    const onSettled = vi.fn()

    await expect(() => runWithDelayedLoading(mockTask, {
      loadingDelay: 100,
      onLoading,
      onSettled
    })).rejects.toThrow("Failed")

    await vi.advanceTimersByTimeAsync(100)
    expect(onLoading).toBeCalledTimes(0)
    expect(onSettled).toBeCalledTimes(0)
    expect(mockTask).toBeCalledTimes(1)
  })

  it("should work with default parameters", async () => {
    vi.useFakeTimers()

    const mockTask = vi.fn().mockResolvedValue("result")
    const promise = runWithDelayedLoading(mockTask)

    await vi.advanceTimersByTime(10000) // Default loadingDelay
    mockTask.mock.results[0].value.then(() => {}) // Resolve the task

    await promise
    // No assertions needed, just verifying it doesn't throw
  })

  it("should ensure returned promise not resolve before minLoadingDuration if async task finished before minLoadingDuration ", async () => {
    vi.useFakeTimers()

    const mockTask = vi.fn(() => new Promise(resolve => setTimeout(() => resolve("result"), 300)))
    const onLoading = vi.fn()
    const onSettled = vi.fn()

    const promise = runWithDelayedLoading(mockTask, {
      loadingDelay: 100,
      onLoading,
      onSettled,
      minLoadingDuration: 500
    })

    await vi.advanceTimersByTimeAsync(100) // Reach loadingDelay
    expect(onLoading).toBeCalledTimes(1)
    expect(onSettled).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(200) // Task finishes (total 300ms)
    const isSettled1 = await Promise.race([
      promise.then(() => true, () => true),
      Promise.resolve(false).then(r => r)
    ])
    expect(isSettled1).toBe(false) // promise should not settle
    expect(onSettled).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(300) // minLoadingDuration reached (500ms total)
    const isSettled2 = await Promise.race([
      promise.then(() => true, () => true),
      Promise.resolve(false).then(r => r)
    ])
    const result = await promise
    expect(result).toBe("result")
    expect(isSettled2).toBe(true) // promise should be settled
    expect(onSettled).toBeCalledTimes(1)
  })
})

