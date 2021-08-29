import "./Popup.css"

export default function Popup(props: any) {
    return (
        <div className="popup" onClick={props.close}>
            <div className="popupContent">
                <h1>{props.movie.name}</h1>
                <button onClick={props.close}>close me</button>
            </div>
        </div>
    )
}