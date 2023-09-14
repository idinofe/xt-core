import { validateIndexedDBOpenable } from '@dinofe/xt-core/web'
import { delay } from '@dinofe/xt-core/common'
import { useState, useEffect } from 'react'

function ValidateIndexedDBOpenable () {
  const [isIndexedDBSupport, setIsIndexedDBSupport] = useState('检测中')

  const check = async () => {
    setIsIndexedDBSupport('检测中')
    await delay(1000)
    validateIndexedDBOpenable().then(isSupport => {
      setIsIndexedDBSupport(isSupport)
    })
  }
  
  const handleCheckClick = () => {
    check()
  }

  useEffect(() => {
    check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <div className="validate-indexedDB-openable">
      <div className="card">
        <p>是否支持indexedDB: {isIndexedDBSupport + ''}</p>
        <button onClick={handleCheckClick}>检测</button>
      </div>
    </div>
  )
}

export default ValidateIndexedDBOpenable
