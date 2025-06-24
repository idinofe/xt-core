import { delay, isString } from "@dinofe/xt-core/common"
import { getStorageSize, StorageType } from "@dinofe/xt-core/web"
import { useEffect, useState } from "react"

function GetStorageSize() {
  const [localSize, setLocalSize] = useState('获取中')
  const [sessionSize, setSessionSize] = useState('获取中')

  const handleLocalClick = async () => {
    setLocalSize('获取中')
    await delay(1000)
    setLocalSize(getStorageSize(StorageType.localStorage))
  }
  
  const handleSessionClick = async () => {
    setSessionSize('获取中')
    await delay(1000)
    setSessionSize(getStorageSize(StorageType.sessionStorage))
  }

  useEffect(() => {
    handleLocalClick()
    handleSessionClick()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <div className="get-storage-size">
      <div className="card">
      <div class="line-1">
        <p>localStorage占用空间大小：</p>
        <p style={{ 'overflow-wrap': 'break-word' }}>{ isString(localSize) ? localSize : JSON.stringify(localSize) }</p>
        <button onClick={handleLocalClick}>获取</button>
      </div>
      <div class="line-2">
        <p>sessionStorage占用空间大小：</p>
        <p style={{ 'overflow-wrap': 'break-word' }}>{ isString(sessionSize) ? sessionSize : JSON.stringify(sessionSize) }</p>
        <button onClick={handleSessionClick}>获取</button>
      </div>
      </div>
    </div>
  )
}

export default GetStorageSize
