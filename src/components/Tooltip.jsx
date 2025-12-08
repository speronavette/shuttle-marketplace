import { useState } from 'react'

export default function Tooltip({ text, children }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <span 
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '4px' 
      }}
    >
      {children}
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          backgroundColor: '#e5e7eb',
          color: '#6b7280',
          borderRadius: '50%',
          fontSize: '11px',
          fontWeight: '600',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        ?
      </span>
      
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#111827',
            color: 'white',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            lineHeight: '1.5',
            width: '220px',
            textAlign: 'left',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {text}
          {/* Petite flèche */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #111827'
            }}
          />
        </div>
      )}
    </span>
  )
}