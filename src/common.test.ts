import { floatDivide, floatMultiply, isEncodeURILike, toNonExponential } from "./common"


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
