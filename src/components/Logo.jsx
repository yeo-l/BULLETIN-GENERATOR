import React from 'react'

const Logo = ({ size = 'medium', showText = true, variant = 'full' }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: '24px', height: '24px' },
          text: { fontSize: '12px' }
        }
      case 'medium':
        return {
          container: { width: '32px', height: '32px' },
          text: { fontSize: '14px' }
        }
      case 'large':
        return {
          container: { width: '48px', height: '48px' },
          text: { fontSize: '18px' }
        }
      default:
        return {
          container: { width: '32px', height: '32px' },
          text: { fontSize: '14px' }
        }
    }
  }

  const sizeStyles = getSizeStyles()

  if (variant === 'icon-only') {
    return (
      <div style={{
        ...sizeStyles.container,
        borderRadius: '6px',
        backgroundColor: '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Croix médicale */}
        <div style={{
          width: size === 'small' ? '12px' : size === 'large' ? '20px' : '16px',
          height: '2px',
          backgroundColor: 'white',
          position: 'absolute',
          borderRadius: '1px'
        }}></div>
        <div style={{
          width: '2px',
          height: size === 'small' ? '12px' : size === 'large' ? '20px' : '16px',
          backgroundColor: 'white',
          position: 'absolute',
          borderRadius: '1px'
        }}></div>
        {/* Points décoratifs */}
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '2px',
          height: '2px',
          backgroundColor: '#f97316',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '2px',
          height: '2px',
          backgroundColor: '#f97316',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '2px',
          left: '2px',
          width: '2px',
          height: '2px',
          backgroundColor: '#f97316',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: '2px',
          height: '2px',
          backgroundColor: '#f97316',
          borderRadius: '50%'
        }}></div>
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          ...sizeStyles.container,
          borderRadius: '6px',
          backgroundColor: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Croix médicale */}
          <div style={{
            width: size === 'small' ? '12px' : size === 'large' ? '20px' : '16px',
            height: '2px',
            backgroundColor: 'white',
            position: 'absolute',
            borderRadius: '1px'
          }}></div>
          <div style={{
            width: '2px',
            height: size === 'small' ? '12px' : size === 'large' ? '20px' : '16px',
            backgroundColor: 'white',
            position: 'absolute',
            borderRadius: '1px'
          }}></div>
          {/* Points décoratifs */}
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: '2px',
            height: '2px',
            backgroundColor: '#f97316',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '2px',
            height: '2px',
            backgroundColor: '#f97316',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '2px',
            left: '2px',
            width: '2px',
            height: '2px',
            backgroundColor: '#f97316',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '2px',
            height: '2px',
            backgroundColor: '#f97316',
            borderRadius: '50%'
          }}></div>
        </div>
        {showText && (
          <div>
            <div style={{
              fontSize: sizeStyles.text.fontSize,
              fontWeight: '700',
              color: '#1e293b',
              lineHeight: '1.2'
            }}>
              Bulletin
            </div>
            <div style={{
              fontSize: size === 'small' ? '10px' : '12px',
              fontWeight: '500',
              color: '#64748b',
              lineHeight: '1.2'
            }}>
              Generator
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

export default Logo
