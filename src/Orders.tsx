import React, { useEffect, useState } from 'react';
import { API_BASE } from './config';
import axios from 'axios';

interface Order {
  id: number;
  user_id: number;
  status: string;
  order_items: number[];
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  type: string;
  price: number;
}

interface OrderItem {
  id: number;
  item_id: number;
  amount: number;
}

interface GroupedItems {
  [type: string]: MenuItem[];
}

const Orders: React.FC = () => {
  // Define the state variables for menu items, grouped items, quantities, cart, user orders, and order items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedItems>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [allOrderItems, setAllOrderItems] = useState<OrderItem[]>([]);
  const [viewingOrders, setViewingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOrder = ["appetizer", "main course", "drink", "snack", "dessert"];

  useEffect(() => {
    const fetchMenuItems = async () => {
      // Check if user is logged in
      const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setError('You must be logged in to place an order.');
          return;
        }
      
      try {
        let allItems: MenuItem[] = [];
        let url = '/api/menu-items/';

        while (url) {
          const response = await axios.get(`${API_BASE}${url}`);
          allItems = [...allItems, ...response.data.results];
          url = response.data.next ? response.data.next.replace('https://burgirs.2.rahtiapp.fi', '') : '';
        }

        setMenuItems(allItems);

        const grouped = allItems.reduce((groups: Record<string, MenuItem[]>, item) => {
          if (!groups[item.type]) groups[item.type] = [];
          groups[item.type].push(item);
          return groups;
        }, {});
        setGroupedItems(grouped);

      } catch (err) {
        console.error('Failed to fetch menu items:', err);
        setError('Failed to load menu.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const increaseQuantity = (itemId: number) => {
    // Increase amount of item, prevent negative quantities
    setQuantities(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const decreaseQuantity = (itemId: number) => {
    // Decrease amount of item, prevent negative quantities
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
    }));
  };

  const addToCart = async (item: MenuItem) => {
    // Add item to cart, send POST request to API
    const amount = quantities[item.id];
    if (!amount || amount <= 0) return;

    try {
      const response = await axios.post(`${API_BASE}/api/order-items/`, {
        item_id: item.id,
        amount,
      });

      const createdOrderItem: OrderItem = response.data;
      setCart(prev => [...prev, createdOrderItem]);
      setQuantities(prev => ({ ...prev, [item.id]: 0 }));
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const removeFromCart = async (orderItemId: number) => {
    // Remove item from cart
    try {
      await axios.delete(`${API_BASE}/api/order-items/${orderItemId}/`);
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      alert('Failed to remove item from cart.');
    }
    setCart(prev => prev.filter(item => item.id !== orderItemId));
  };

  const placeOrder = async () => {
    // Place order, send POST request to API
    if (cart.length === 0) return;

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('You must be logged in to place an order.');
      return;
    }

    const user = JSON.parse(storedUser);

    setPlacingOrder(true);
    const order_items = cart.map(item => item.id);
    try {
      const response = await axios.post(`${API_BASE}/api/orders/`, {
        status: "pending",
        user_id: user.id,
        order_items: order_items,
      });

      console.log('Order placed:', response.data);
      setCart([]);
      alert('Order placed successfully!');
    } catch (err) {
      console.error('Failed to place order:', err);
    } finally {
      setPlacingOrder(false);
    }
  };

  const fetchUserOrders = async () => {
    // Fetch user orders, send GET request to API
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('You must be logged in to view your orders.');
      return;
    }

    const user = JSON.parse(storedUser);

    try {
      let allOrders: Order[] = [];
      const url = `/api/users/${user.id}/orders/`;

      const response = await axios.get(`${API_BASE}${url}`);
      allOrders = [...allOrders, ...response.data];
      setUserOrders(allOrders);
      setViewingOrders(true);

      // Fetch all order items
      let items: OrderItem[] = [];
      let itemUrl = '/api/order-items/';

      while (itemUrl) {
        const res = await axios.get(`${API_BASE}${itemUrl}`);
        items = [...items, ...res.data.results];
        itemUrl = res.data.next ? res.data.next.replace('https://burgirs.2.rahtiapp.fi', '') : '';
      }

      setAllOrderItems(items);
    } catch (err) {
      console.error('Failed to fetch user orders or order items:', err);
      setError('Failed to fetch your orders.');
    }
  };

  const toggleExpand = (orderId: number) => {
    // Toggle expanded order details
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const findMenuItem = (itemId: number) => {
    // Find menu item by ID
    return menuItems.find(m => m.id === itemId);
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading menu...</div>;
  if (error) return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;

  return (
    // Main component rendering
    <div className="p-8 flex flex-col items-center">
      <div className="mb-6">
        <button
          onClick={fetchUserOrders}
          className="px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition"
        >
          View My Orders
        </button>
      </div>

      {viewingOrders && (
        <div className="w-full max-w-4xl mb-8 bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">My Orders</h2>

          {userOrders.length > 0 ? (
            <div className="flex flex-col gap-4">
              {userOrders.map(order => (
                <div key={order.id} className="border-b pb-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <p>
                      <span className="font-semibold">Order #{order.id}</span> - Status: <span className="capitalize">{order.status}</span>
                    </p>
                    <p className="text-blue-500 text-sm">
                      {expandedOrderId === order.id ? 'Hide Details ▲' : 'View Details ▼'}
                    </p>
                  </div>

                  {expandedOrderId === order.id && (
                    <div className="mt-2 pl-4">
                      {order.order_items.map((orderItemId: number) => {
                        const orderItem = allOrderItems.find(oi => oi.id === orderItemId);
                        if (!orderItem) return null;

                        const menuItem = findMenuItem(orderItem.item_id);
                        return (
                          <div key={orderItem.id} className="flex justify-between items-center mb-2">
                            <div>
                              <p className="font-semibold">{menuItem?.name || 'Unknown Item'}</p>
                              <p className="text-gray-500 text-sm">Amount: {orderItem.amount}</p>
                            </div>
                            <p className="font-bold">
                              {menuItem ? (menuItem.price * orderItem.amount).toFixed(2) : '0.00'} €
                            </p>
                          </div>
                        );
                      })}

                      <div className="mt-2 flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>
                          {order.order_items.reduce((total: number, itemId: number) => {
                            const orderItem = allOrderItems.find(o => o.id === itemId);
                            const menuItem = orderItem ? menuItems.find(m => m.id === orderItem.item_id) : null;
                            return orderItem && menuItem ? total + menuItem.price * orderItem.amount : total;
                          }, 0).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>You have no orders yet.</p>
          )}

          <button
            onClick={() => setViewingOrders(false)}
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition"
          >
            Back to Create Order
          </button>
        </div>
      )}

      {!viewingOrders && (
        <>
          <h1 className="text-3xl font-bold mb-8">Create an Order</h1>

          {Object.keys(groupedItems)
            .sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b))
            .map((type) => (
              <div key={type} className="w-full max-w-6xl mb-12">
                <h2 className="text-2xl font-bold mb-4 capitalize text-center">{type}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedItems[type].map(item => (
                    <div key={item.id} className="p-6 border rounded-2xl shadow-md bg-white flex flex-col items-center">
                      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      <p className="text-lg font-bold mb-4">{item.price} €</p>

                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="bg-red-500 text-white rounded-full px-3 py-1"
                        >
                          -
                        </button>
                        <span>{quantities[item.id] || 0}</span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="bg-green-500 text-white rounded-full px-3 py-1"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => addToCart(item)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        disabled={!quantities[item.id]}
                      >
                        Add to Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          <button
            onClick={placeOrder}
            className={`mt-8 px-8 py-4 text-white font-bold rounded-2xl transition ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            disabled={cart.length === 0 || placingOrder}
          >
            {placingOrder ? 'Placing Order...' : 'Place Order'}
          </button>

          {cart.length > 0 && (
            <div className="mt-12 w-full max-w-4xl bg-white shadow-md rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

              <div className="flex flex-col gap-4">
                {cart.map((orderItem) => {
                  const menuItem = findMenuItem(orderItem.item_id);
                  return (
                    <div key={orderItem.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-semibold">{menuItem?.name || 'Unknown Item'}</p>
                        <p className="text-gray-500 text-sm">Amount: {orderItem.amount}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">
                          {menuItem ? (menuItem.price * orderItem.amount).toFixed(2) : '0.00'} €
                        </span>
                        <button
                          onClick={() => removeFromCart(orderItem.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>
                  {cart.reduce((total, item) => {
                    const menuItem = findMenuItem(item.item_id);
                    return menuItem ? total + menuItem.price * item.amount : total;
                  }, 0).toFixed(2)} €
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
