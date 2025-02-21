import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { inventoryService } from "../../firebase/services/inventoryService";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import "./Inventory.css";

const Inventory = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const items = await inventoryService.getAllInventory();
        setInventory(items);
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const searchString = searchTerm.toLowerCase();
    return (
      item.make?.toLowerCase().includes(searchString) ||
      item.model?.toLowerCase().includes(searchString) ||
      item.vin?.toLowerCase().includes(searchString)
    );
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate());
      case "oldest":
        return new Date(a.createdAt?.toDate()) - new Date(b.createdAt?.toDate());
      case "priceHigh":
        return (b.price || 0) - (a.price || 0);
      case "priceLow":
        return (a.price || 0) - (b.price || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="inventory-container">
        <div className="inventory-header">
            <div className="header-content">
                <h1>Inventory</h1>
                <button 
                    className="btn-primary"
                    onClick={() => navigate('/inventory/add')}
                >
                    <TruckIcon className="icon" />
                    Add New Vehicle
                </button>
            </div>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="controls-right">
                <button
                    className="btn-filter"
                    onClick={() => setFilterOpen(!filterOpen)}
                >
                    <FunnelIcon className="icon" />
                    Filters
                </button>

                <div className="sort-dropdown">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priceHigh">Price: High to Low</option>
                        <option value="priceLow">Price: Low to High</option>
                    </select>
                    <ChevronDownIcon className="dropdown-icon" />
                </div>
            </div>
        </div>

        {loading ? (
            <div className="loading">Loading inventory...</div>
        ) : error ? (
            <div className="error-message">{error}</div>
        ) : (
            <div className="inventory-grid">
                {sortedInventory.map((item) => (
                    <div
                        key={item.id}
                        className="inventory-card"
                        onClick={() => navigate(`/inventory/${item.id}`)}
                    >
                        <div className="inventory-image">
                            <img
                                src={item.images?.[0]?.url || "/placeholder-truck.png"}
                                alt={`${item.year} ${item.make} ${item.model}`}
                                onError={(e) => {
                                    e.target.src = "/placeholder-truck.png";
                                    e.target.onerror = null;
                                }}
                            />
                        </div>
                        <div className="inventory-details">
                            <h3>
                                {item.year} {item.make} {item.model}
                            </h3>
                            <div className="inventory-specs">
                                {item.mileage && (
                                    <span>{item.mileage.toLocaleString()} miles</span>
                                )}
                                {item.engine && <span>{item.engine}</span>}
                                {item.transmission && <span>{item.transmission}</span>}
                            </div>
                            <div className="seller-info">
                                <span className="seller-name">
                                    {item.sellerInfo?.businessName || "Unknown Seller"}
                                </span>
                                <span className="seller-location">
                                    {item.sellerInfo?.location || "Location not available"}
                                </span>
                            </div>
                            <div className="inventory-footer">
                                <span className="price">
                                    ${(item.price || 0).toLocaleString()}
                                </span>
                                <span
                                    className={`status-badge ${item.status || "unknown"}`}
                                >
                                    {item.status || "unknown"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {sortedInventory.length === 0 && (
                    <div className="no-results">
                        <p>No inventory items found</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default Inventory;
