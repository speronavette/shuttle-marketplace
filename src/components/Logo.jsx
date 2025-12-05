import logoSvg from '../assets/logo.svg'

export default function Logo({ size = 'default' }) {
  const sizes = {
    small: 'h-8',
    default: 'h-10',
    large: 'h-14'
  }

  return (
    <img 
      src={logoSvg} 
      alt="Shuttle Marketplace" 
      className={sizes[size]}
    />
  )
}