let i = 0

export default ref =>
  ref && ref.current
    ? ref.current.id ||
      (() => {
        const id = `id-${i++}`
        ref.current.setAttribute('id', id)
        return id
      })()
    : null
