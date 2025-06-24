import { delay } from "@dinofe/xt-core/common"
import { validateStorageAvailable, StorageType } from "@dinofe/xt-core/web"
import { useEffect, useState } from "react"

function ValidateStorageAvailable() {
  const [isLocalStorageAvaiable, setIsLocalStorageAvaiable] = useState('检测中')
  const [isSessionStorageAvaiable, setIsSessionStorageAvaiable] = useState('检测中')

  const handleCheckLocalClick = async () => {
    setIsLocalStorageAvaiable('检测中')
    await delay(1000)
    setIsLocalStorageAvaiable(validateStorageAvailable(StorageType.localStorage))
  }
  
  const handleCheckSessionClick = async () => {
    setIsSessionStorageAvaiable('检测中')
    await delay(1000)
    setIsSessionStorageAvaiable(validateStorageAvailable(StorageType.sessionStorage))
  }

  useEffect(() => {
    handleCheckLocalClick()
    handleCheckSessionClick()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="validate-storage-avaiable">
      <div className="card">
        <div className="line-1">
          <p>是否支持localStorage：{ isLocalStorageAvaiable + '' }</p>
          <button onClick={handleCheckLocalClick}>检测</button>
        </div>
        <div className="line-2">
          <p>是否支持sessionStorage：{ isSessionStorageAvaiable + '' }</p>
          <button onClick={handleCheckSessionClick}>检测</button>
        </div>
      </div>
    </div>
  )
}

export default ValidateStorageAvailable
