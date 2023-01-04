import { SVGAttributes } from "react";

export interface IconProps extends SVGAttributes<SVGElement> { }

export function Icon(props: IconProps): JSX.Element {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2px"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={props.className}>

            <path d="M7.84,21H5a2,2,0,0,1-2-2V7A2,2,0,0,1,5,5H17a2,2,0,0,1,2,2v4" />
            <path d="M15,3V7" />
            <path d="M7,3V7" />
            <path d="M3,9.41H19" />
            <path className="stroke-primary" d="M15.44,20l-1.07,1.07,1.07,1.07" />
            <path className="stroke-primary" d="M14.38,21.05h4.81a1.07,1.07,0,0,0,.93-1.47l-.29-.53" />
            <path className="stroke-primary" d="M13.59,16.78l-.39-1.46-1.46.39" />
            <path className="stroke-primary" d="M13.2,15.32l-2.4,4.16a1.07,1.07,0,0,0,.8,1.54h.61" />
            <path className="stroke-primary" d="M17.29,16.78l1.46.39.39-1.46" />
            <path className="stroke-primary" d="M18.75,17.17,16.35,13a1.07,1.07,0,0,0-1.74-.07l-.32.52" />
        </svg>)
}