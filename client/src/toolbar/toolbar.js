import "./toolbar.css";

export const Toolbar = ({openMap}) => {
    return <div className="card toolbar">
        <div className="map" onClick={openMap}>🗺</div>
    </div>
}