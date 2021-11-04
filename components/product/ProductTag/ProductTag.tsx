import cn from 'classnames'
import { inherits } from 'util'
import s from './ProductTag.module.css'

interface ProductTagProps {
  className?: string
  discount?: string
  name: string
  price: string
  fontSize?: number
}

const ProductTag: React.FC<ProductTagProps> = ({
  discount,
  name,
  price,
  className = '',
  fontSize = 32,
}) => {
  return (
    <div className={cn(s.root, className)}>
      <h3 className={s.name}>
        <span
          className={cn({ [s.fontsizing]: fontSize < 32 })}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${fontSize}px`,
          }}
        >
          {name}
        </span>
      </h3>
      <div className={s.price}>{price}</div>
      {discount ? <div className={s.discount}>-{discount}</div> : null}
    </div>
  )
}

export default ProductTag
