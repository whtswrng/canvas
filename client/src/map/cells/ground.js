export const Ground = ({ cell, children }) => {
  const backgroundImageUrl = `/images/materials/${cell.type}.jpg`; // Replace with your image URL

  return (
    <div
      style={{
        backgroundColor: cell.bg,
        height: 40,
        width: 40,
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {children}
    </div>
  );
};
