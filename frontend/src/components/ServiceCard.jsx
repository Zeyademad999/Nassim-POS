import React from "react";
import { usePOS } from "../context/POSContext";
import "../styles/ServiceCard.css";

const ServiceCard = ({ service }) => {
  const { addService } = usePOS();

  const handleAddService = () => {
    const serializableService = {
      id: service.id,
      name: service.name,
      price: service.price,
      // Add any other properties you need, but NO React icons
    };
    addService(serializableService);
  };

  return (
    <div className="service-card" onClick={handleAddService}>
      <div className="service-card-inner">
        <h3 className="service-name">{service.name}</h3>
        <p className="service-price">{service.price.toFixed(2)} EGP</p>
        <div className="hover-line"></div>
      </div>
      <button className="service-btn">Add to Bill</button>
    </div>
  );
};

export default ServiceCard;
