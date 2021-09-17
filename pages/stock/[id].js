import { useRouter } from 'next/router'

const Stock = () => {
  const router = useRouter()
  const { id } = router.query

  return <p>Stock: {id}</p>
}

export default Stock