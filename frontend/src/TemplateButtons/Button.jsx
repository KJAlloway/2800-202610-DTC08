import React from 'react'
import './Button.css'

const Button = ({
                    text,
                    className = '',
                    onClick,
                    type = 'button',
                    ...rest
                }) => {
    return (
        <button
            type={type}
            className={`general-button ${className}`.trim()}
            onClick={onClick}
            {...rest}
        >
      <span className="button-content">
        {text}
      </span>
        </button>
    )
}

export default Button
