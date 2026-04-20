import { SVGProps } from "react"

export const ArrowUp = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg {...props} viewBox="0 0 86 135" width="86" height="135" xmlns="http://www.w3.org/2000/svg">
            <polygon
                fill="currentColor"
                points="86,77 55,46 55,135 31,135 31,46 0,77 0,43 43,0 86,43"
            />
        </svg>
    )
}