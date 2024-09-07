import React, { useState } from 'react'

const AddUser = () => {
    const [userName,setUserName] = useState('')
    const [lastName,setLastName] = useState('')
    const [firstName, setFirstName] = useState('')

  return (
    <div className='w-full flex flex-col items-center justify-center z-50'>
      <form className='w-full max-w-sm'>
        <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="eventId">

                    </label>
        </div>
        <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="userName">
                Họ và tên
            </label>
            <input 
                id='userName'
                type="text"
                value={userName}
                onChange={(e)=>setUserName(e.target.value)}
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                placeholder='Điền họ và tên người tham gia'
                 />
        </div>

      </form>

    </div>
  )
}

export default AddUser
