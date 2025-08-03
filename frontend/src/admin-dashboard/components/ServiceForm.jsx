// import React, { useEffect, useState } from "react";

// export default function ServiceForm({ service, onSave, onCancel }) {
//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [description, setDescription] = useState("");

//   useEffect(() => {
//     if (service) {
//       setName(service.name);
//       setPrice(service.price);
//       setDescription(service?.description || "");
//     } else {
//       setName("");
//       setPrice("");
//     }
//   }, [service]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const numericPrice = parseFloat(price);
//     if (name.trim() && numericPrice >= 0) {
//       onSave({ id: service?.id, name, price: numericPrice, description });
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="service-form">
//       <input
//         type="text"
//         value={name}
//         placeholder="Service Name"
//         onChange={(e) => setName(e.target.value)}
//         required
//       />
//       <input
//         type="number"
//         value={price}
//         placeholder="Price"
//         onChange={(e) => setPrice(e.target.value)}
//         step="0.01"
//         required
//       />
//       <textarea
//         value={description}
//         placeholder="Description (optional)"
//         onChange={(e) => setDescription(e.target.value)}
//         rows={3}
//       />

//       <button type="submit">{service ? "Update" : "Add Service"}</button>
//       {service && <button onClick={onCancel}>Cancel</button>}
//     </form>
//   );
// }
