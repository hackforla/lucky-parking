interface SelectProps {
  id: string
}

export default function Select({ id }: SelectProps){
  return (
    <div className="font-normal leading-[16.8px] text-xs text-black-300 text-center">{id}</div>
  )
}
