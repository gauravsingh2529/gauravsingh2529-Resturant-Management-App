import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Admin = () => {
  const token = localStorage.getItem("accesstoken");
  const [updateDesc, setUpdateDesc] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  const [updateImage, setUpdateImage] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [dishes, setDishes] = useState([]);

  // Managing order status
  const [selectedStatus, setSelectedStatus] = useState("");

  const clickToSetCompleted = (orderId) => {
    handleStatus(orderId, "Completed");
  };

  const handleStatus = async (orderId, status) => {
    if (window.confirm("Are you sure you want to update the status?")) {
      try {
        await axios.patch(
          `http://localhost:3000/api/v1/UpdateOrderStatus/${orderId}`,
          { status },
          {
            headers: {
              accesstoken: token,
            },
          }
        );
        setSelectedStatus(status);
        alert("Order status updated successfully");
        // Optionally, refresh the orders list or update the specific order in state
      } catch (err) {
        setError(err.message);
        alert("Failed to update order status");
      }
    }
  };

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  // New state for Add New Dish form
  const [foodName, setFoodName] = useState("");
  const [foodDesc, setFoodDesc] = useState("");
  const [foodPrice, setFoodPrice] = useState("");
  const [foodType, setFoodType] = useState("");
  const [foodImage, setFoodImage] = useState(null);

  const [orders, setOrders] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const isCheck = localStorage.getItem("accesstoken");
    if (!isCheck) {
      navigate("/");
      return;
    }

    // get all user
    const fetchUsers = async () => {
      try {
        if (!token) {
          navigate("/adminlog-in");
          return;
        }
        const response = await axios.get(
          "http://localhost:3000/api/v1/adminGetuserInfo",
          {
            headers: {
              accesstoken: token,
            },
          }
        );
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(true);
      }
    };

    // get all food
    const fetchDishes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/getAllfoods",
          {
            headers: {
              accesstoken: token,
            },
          }
        );
        setDishes(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(true);
      }
    };

    // get all orderinfo
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/adminGetOrderInfo",
          {
            headers: {
              accesstoken: token,
            },
          }
        );
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(true);
      }
    };
    fetchDishes();

    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "food") {
      fetchDishes();
    }
  }, [activeTab, navigate, token]);

  const handleLogout = () => {
    // Clear the access token from local storage
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("refreshtoken");

    // Redirect to the login page
    navigate("/login");
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(
          `http://localhost:3000/api/v1/deleteUser/${userId}`,
          {
            headers: {
              accesstoken: token,
            },
          }
        );
        setUsers(users.filter((user) => user._id !== userId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDishDelete = async (dishId) => {
    if (window.confirm("Are you sure you want to delete this dish?")) {
      try {
        await axios.delete(
          `http://localhost:3000/api/v1/deleteFoodById/${dishId}`,
          {
            headers: {
              accesstoken: token,
            },
          }
        );
        setDishes(dishes.filter((dish) => dish._id !== dishId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleUpdateDish = async (id) => {
    if (!selectedDish) return;
    const formData = new FormData();
    formData.append("food", updateName || selectedDish.food);
    formData.append("desc", updateDesc || selectedDish.desc);
    formData.append("price", updatePrice || selectedDish.price);
    if (updateImage) {
      formData.append("image", updateImage);
    }

    try {
      const response = await axios.patch(
        `http://localhost:3000/api/v1/updateFoodItems/${id}`,
        formData,
        {
          headers: {
            accesstoken: token,
          },
        }
      );
      setDishes(
        dishes.map((dish) =>
          dish._id === id ? { ...dish, ...response.data } : dish
        )
      );
      setSelectedDish(null);
      setUpdateDesc("");
      setUpdateName("");
      setUpdatePrice("");
      setUpdateImage(null);
    } catch (err) {
      setError("Failed to update dish");
    }
  };

  const handleChange = (event, field) => {
    const value =
      field === "image" ? event.target.files[0] : event.target.value;
    if (field === "desc") {
      setUpdateDesc(value);
    } else if (field === "name") {
      setUpdateName(value);
    } else if (field === "price") {
      setUpdatePrice(value);
    } else if (field === "image") {
      setUpdateImage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("food", foodName);
    formData.append("desc", foodDesc);
    formData.append("price", foodPrice);
    formData.append("type", foodType);
    if (foodImage) {
      formData.append("image", foodImage);
    }

    try {
      await axios.post(
        "http://localhost:3000/api/v1/addNewFoodItems",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            accesstoken: token,
          },
        }
      );
      setFoodName("");
      setFoodDesc("");
      setFoodPrice("");
      setFoodType("");
      setFoodImage(null);
      const response = await axios.get(
        "http://localhost:3000/api/v1/getAllfoods",
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setDishes(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const filterDishes = (dishes) => {
    switch (filter) {
      case "veg":
        return dishes.filter((dish) => dish.type === "veg");
      case "non-veg":
        return dishes.filter((dish) => dish.type === "non-veg");
      case "price-low":
        return [...dishes].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...dishes].sort((a, b) => b.price - a.price);
      case "all":
      default:
        return dishes;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        if (loading) return <div className="p-3">Loading...</div>;
        if (error) return <div className="p-3 text-danger">Error: {error}</div>;
        return (
          <div className="p-3">
            <h3>Users</h3>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>PIN</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.Fname}</td>
                    <td>{user.Lname}</td>
                    <td>{user.Phone}</td>
                    <td>{user.address}</td>
                    <td>{user.pin}</td>
                    <td>{user.email}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "orders":
        if (loading) return <div className="p-3">Loading...</div>;
        if (error) return <div className="p-3 text-danger">Error: {error}</div>;
        return (
          <div className="p-3">
            <h3>Orders</h3>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User Name</th>
                  <th>Food Items</th>
                  <th>Address</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  // Find the user details based on user_id
                  const user = users.find((u) => u._id === order.user_id);

                  return (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>
                        {user ? `${user.Fname} ${user.Lname}` : "Unknown User"}
                      </td>
                      <td>
                        {order.items.map((item) => {
                          const food = dishes.find(
                            (d) => d._id === item.food_id
                          );
                          return food ? (
                            <div key={item.food_id}>
                              <img
                                src={food.image}
                                alt={food.food}
                                style={{ width: "50px", height: "50px" }}
                              />
                              <h5>{food.food}</h5>
                              <p>{food.desc}</p>
                              <p>Price: ${food.price}</p>
                              <p>Quantity: {item.quantity}</p>
                              <hr />
                            </div>
                          ) : (
                            <div key={item.food_id}>Unknown Food</div>
                          );
                        })}
                      </td>
                      <td>{order.delivery_address}</td>
                      <td>{order.total_price}</td>
                      <td>
                        <span
                          className={`badge rounded-pill bg-${
                            order.status === "Completed" ? "success" : "warning"
                          }`}
                        >
                          {order.status}
                        </span>
                        <select
                          className="mt-2"
                          value={order.status}
                          onChange={(e) =>
                            handleStatus(order._id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => clickToSetCompleted(order._id)}
                        >
                          Mark as Completed
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "food":
        if (loading) return <div className="p-3">Loading...</div>;
        if (error) return <div className="p-3 text-danger">Error: {error}</div>;
        return (
          <div className="p-3">
            <h3>Food Items</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Food Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Food Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Food Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={foodPrice}
                  onChange={(e) => setFoodPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Food Type</label>
                <select
                  className="form-control"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                </select>
              </div>
              <div className="form-group">
                <label>Food Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setFoodImage(e.target.files[0])}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary mt-3">
                Add New Dish
              </button>
            </form>

            <h4 className="mt-4">Existing Dishes</h4>
            <select
              className="form-control mb-3"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Dish ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterDishes(dishes).map((dish) => (
                  <tr key={dish._id}>
                    <td>{dish._id}</td>
                    <td>{dish.food}</td>
                    <td>{dish.desc}</td>
                    <td>{dish.price}</td>
                    <td>{dish.type}</td>
                    <td>
                      <img
                        src={dish.image}
                        alt={dish.food}
                        style={{ width: "50px", height: "50px" }}
                      />
                    </td>
                    <td className="d-flex align-item-center justify-content-center">
                      <button
                        className="btn btn-danger btn-sm m-1"
                        onClick={() => handleDishDelete(dish._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-warning btn-sm m-1"
                        onClick={() => setSelectedDish(dish)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedDish && (
              <div className="mt-4">
                <h5>Update Dish</h5>
                <form>
                  <div className="form-group">
                    <label>Dish Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={updateName}
                      onChange={(e) => handleChange(e, "name")}
                      placeholder={selectedDish.food}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dish Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={updateDesc}
                      onChange={(e) => handleChange(e, "desc")}
                      placeholder={selectedDish.desc}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dish Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={updatePrice}
                      onChange={(e) => handleChange(e, "price")}
                      placeholder={selectedDish.price}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dish Image</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleChange(e, "image")}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-success mt-3"
                    onClick={() => handleUpdateDish(selectedDish._id)}
                  >
                    Update Dish
                  </button>
                </form>
              </div>
            )}
          </div>
        );

      default:
        return <div className="p-3">Select a tab to view content.</div>;
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <button
                  className={`nav-link btn ${
                    activeTab === "users" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("users")}
                >
                  Users
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn ${
                    activeTab === "orders" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("orders")}
                >
                  Orders
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn ${
                    activeTab === "food" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("food")}
                >
                  Food
                </button>
              </li>
            </ul>
          </div>
        </div>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <div className="container mt-4">{renderContent()}</div>
    </div>
  );
};

export default Admin;
