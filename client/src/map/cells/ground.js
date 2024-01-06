export const Ground = ({ cell, children, ...rest }) => {
  const backgroundImageUrl = `/images/materials/${cell.type}.jpg`; // Replace with your image URL

  return (
    <div
      {...rest}
      style={{
        backgroundColor: cell.bg,
        height: 40,
        width: 40,
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      title={cell.x + " " + cell.y}
    >
      {children}
    </div>
  );
};
