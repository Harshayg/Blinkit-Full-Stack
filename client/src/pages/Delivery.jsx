import React, { useEffect, useState } from 'react';
// Assuming you have an authentication context or similar to get user info if needed for roles
// import { useAuth } from '../context/AuthContext';

const Delivery = () => {
    // State to store the fetched orders
    const [orders, setOrders] = useState([]);
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State to manage error status
    const [error, setError] = useState(null);

    // Fetch orders when the component mounts
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Replace with your actual backend endpoint for fetching all orders
                // This endpoint should be protected and only accessible by admin/owner roles
                const response = await fetch('/api/admin/orders', {
                    // You might need to include authentication headers here
                    // headers: {
                    //     'Authorization': `Bearer ${yourAuthToken}`,
                    //     'Content-Type': 'application/json'
                    // }
                });

                if (!response.ok) {
                    // Handle non-200 responses
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch orders');
                }

                const data = await response.json();
                // Assuming the backend response has a 'data' field containing the array of orders
                setOrders(data.data);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []); // The empty dependency array ensures this runs only once on mount

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl font-semibold">Loading orders...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-xl font-semibold text-red-600">Error: {error}</div>;
    }

    if (orders.length === 0) {
        return <div className="flex justify-center items-center h-screen text-xl font-semibold">No orders found.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">All Customer Orders</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                            {/* Assuming your backend populates user details or at least sends userId */}
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Customer ID</th>
                            {/* Add Customer Name/Email if your backend provides it */}
                            {/* <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Customer Name</th> */}
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Products</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment Status</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Delivery Address</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Order Time</th>
                            {/* Add Coupon Details if needed */}
                            {/* <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Coupon</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Discount</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.orderId} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-800">{order.orderId}</td>
                                {/* Display customer ID or other relevant user info */}
                                <td className="py-3 px-4 text-sm text-gray-800">{order.userId}</td>
                                {/* Display customer name/email if available */}
                                {/* <td className="py-3 px-4 text-sm text-gray-800">{order.customerName}</td> */}
                                <td className="py-3 px-4 text-sm text-gray-800">
                                    {/* Assuming product_details is an array of product objects */}
                                    {order.products && order.products.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {order.products.map((product, index) => (
                                                <li key={index}>{product.name}</li>
                                            ))}
                                        </ul>
                                    ) : 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-800">₹{order.totalAmt ? order.totalAmt.toFixed(2) : '0.00'}</td>
                                <td className="py-3 px-4 text-sm text-gray-800">{order.payment_status}</td>
                                <td className="py-3 px-4 text-sm text-gray-800">
                                    {/* Assuming delivery_address is an object with address details */}
                                    {order.delivery_address ? (
                                        <div>
                                            {/* Display address details, adjust based on your address schema */}
                                            {order.delivery_address.street}, {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.zipCode}
                                        </div>
                                    ) : 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-800">{new Date(order.createdAt).toLocaleString()}</td>
                                {/* Display Coupon Details if needed */}
                                {/* <td className="py-3 px-4 text-sm text-gray-800">{order.couponCode || 'None'}</td>
                                <td className="py-3 px-4 text-sm text-gray-800">₹{order.couponDiscount ? order.couponDiscount.toFixed(2) : '0.00'}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Delivery;
