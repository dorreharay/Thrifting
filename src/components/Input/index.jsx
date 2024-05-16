import React, { useState } from 'react'
import cx from 'classnames'
import './styles.scss'

function Input(props) {
  const {
    name,
    type,
    disabled,
    prefix,
    onChange,
    showPasswordIcon,
    showClearIcon,
    value,
    containerClassName,
    isSticky,
  } = props

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div
      className={cx(
        'relative input__container overflow-hidden mb-2 rounded-full bg-white border text-base',
        {
          'opacity-50': disabled,
          'pl-6': prefix,
          [containerClassName]: containerClassName,
          'sticky top-0': isSticky,
        },
      )}
    >
      {prefix && (
        <button
          type="button"
          className="absolute left-0 h-full px-4 pr-3 uppercase text-xs font-medium"
          onClick={() => setShowPassword(prev => !prev)}
        >
          <div className={prefix} />
        </button>
      )}

      <input
        {...props}
        type={showPasswordIcon ? (showPassword ? 'text' : 'password') : type}
      />

      {showPasswordIcon && (
        <button
          type="button"
          className="absolute right-1 h-full px-4 uppercase text-xs font-medium"
          onClick={() => setShowPassword(prev => !prev)}
        >
          <div className={`${showPassword ? 'eye' : 'eye-hidden'}`} />
        </button>
      )}

      {showClearIcon && value && (
        <button
          type="button"
          className="absolute right-0 h-full px-4 pr-3 uppercase text-xs font-medium"
          onClick={() => onChange({ target: { name, value: '' } })}
        >
          <div className="clear" />
        </button>
      )}
    </div>
  )
}

export default Input
