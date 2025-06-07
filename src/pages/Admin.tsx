import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Check, X, Users, Briefcase, Eye, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Tabs from "../components/ui/Tabs";
import {
  getUsers,
  getResaleProperties,
  getRentalProperties,
  updatePropertyStatus,
} from "../utils/firestoreListings";
import { User } from "../types";

import { useAuth } from "../utils/authContext";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<any>({ resale: [], rental: [] });
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user || !user.isAdmin) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const allUsers = await getUsers();
        const mappedUsers: User[] = allUsers.map((user: any) => ({
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          city: user.city,
          state: user.state,
          reraNumber: user.reraNumber,
          subscriptionLocations: user.subscriptionLocations,
          isAdmin: user.isAdmin,
          password: "",
          location: { lat: 0, lng: 0 },
        }));
        setUsers(mappedUsers);

        const allResale: any[] = [];
        const allRental: any[] = [];

        for (const user of mappedUsers) {
          const resaleProps = await getResaleProperties(user.id);
          const rentalProps = await getRentalProperties(user.id);
          allResale.push(...resaleProps);
          allRental.push(...rentalProps);
        }

        setInventory({ resale: allResale, rental: allRental });
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to fetch admin data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApproveProperty = async (
    id: string,
    category: "resale" | "rental"
  ) => {
    try {
      setActionLoading(true);
      const property = inventory[category].find((p: any) => p.id === id);
      if (!property) {
        toast.error("Property not found");
        setActionLoading(false);
        return;
      }
      // Check admin role before approving
      if (!user?.isAdmin) {
        toast.error("You do not have permission to approve properties.");
        setActionLoading(false);
        return;
      }
      await updatePropertyStatus(property.userId, category, id, "Approved", true);

      setInventory((prevInventory: { resale: any[]; rental: any[] }) => {
        const updatedProperties = (prevInventory[category] || []).map(
          (property: any) => {
            if (property.id === id) {
              return { ...property, status: "Approved", isApproved: true };
            }
            return property;
          }
        );

        return {
          ...prevInventory,
          [category]: updatedProperties,
        };
      });

      toast.success("Property approved successfully");
    } catch (error) {
      console.error("Error approving property:", error);
      toast.error("Failed to approve property");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProperty = async (
    id: string,
    category: "resale" | "rental"
  ) => {
    try {
      setActionLoading(true);
      const property = inventory[category].find((p: any) => p.id === id);
      if (!property) {
        toast.error("Property not found");
        setActionLoading(false);
        return;
      }
      // Check admin role before rejecting
      if (!user?.isAdmin) {
        toast.error("You do not have permission to reject properties.");
        setActionLoading(false);
        return;
      }
      await updatePropertyStatus(property.userId, category, id, "Rejected", false);

      setInventory((prevInventory: { resale: any[]; rental: any[] }) => {
        const updatedProperties = (prevInventory[category] || []).map(
          (property: any) => {
            if (property.id === id) {
              return { ...property, status: "Rejected", isApproved: false };
            }
            return property;
          }
        );

        return {
          ...prevInventory,
          [category]: updatedProperties,
        };
      });

      toast.success("Property rejected");
    } catch (error) {
      console.error("Error rejecting property:", error);
      toast.error("Failed to reject property");
    } finally {
      setActionLoading(false);
    }
  };

  const viewUserDetails = (user: User) => {
    setUserDetails(user);
    setShowUserModal(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">
            Admin Dashboard
          </h1>
          <p className="text-neutral-500">Manage users and property listings</p>
        </div>

        <Tabs
          tabs={[
            {
              id: "properties",
              label: "Properties",
              content: (
                <Card>
                  <Tabs
                    variant="underline"
                    tabs={[
                      {
                        id: "pending",
                        label: "Pending Approval",
                        content: (
                          <div className="overflow-x-auto">
                            <h3 className="text-lg font-semibold mb-4">
                              Pending Properties
                            </h3>

                            {/* Resale Properties */}
                            <h4 className="font-medium text-neutral-700 mb-2">
                              Resale Properties
                            </h4>
                            {inventory.resale.filter(
                              (p: any) => p.status === "Pending Approval"
                            ).length === 0 ? (
                              <p className="text-neutral-500 italic mb-6">
                                No pending resale properties
                              </p>
                            ) : (
                              <div className="mb-6 overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200" style={{ tableLayout: 'auto', transition: 'all 0.3s ease' }}>
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Type
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Society
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Location
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Price
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-neutral-200">
                                    {inventory.resale
                                      .filter(
                                        (property: any) =>
                                          property.status === "Pending Approval"
                                      )
                                      .map((property: any) => (
                                        <tr
                                          key={property.id}
                                          className="hover:bg-neutral-50"
                                        >
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {format(
                                              new Date(property.createdAt),
                                              "dd/MM/yyyy"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.type}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.society}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.roadLocation}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            ₹
                                            {property.expectedPrice.toLocaleString(
                                              "en-IN"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            <div className="flex space-x-2">
                                              <Button
                                                variant="text"
                                                size="sm"
                                                icon={
                                                  <Eye className="h-4 w-4" />
                                                }
                                                onClick={() =>
                                                  setShowPropertyDetails({
                                                    ...property,
                                                    category: "resale",
                                                  })
                                                }
                                              >
                                                View
                                              </Button>
                                              <Button
                                                variant="primary"
                                                size="sm"
                                                icon={
                                                  <Check className="h-4 w-4" />
                                                }
                                                onClick={() =>
                                                  handleApproveProperty(
                                                    property.id,
                                                    "resale"
                                                  )
                                                }
                                              >
                                                Approve
                                              </Button>
                                              <Button
                                                variant="danger"
                                                size="sm"
                                                icon={<X className="h-4 w-4" />}
                                                onClick={() =>
                                                  handleRejectProperty(
                                                    property.id,
                                                    "resale"
                                                  )
                                                }
                                              >
                                                Reject
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Rental Properties */}
                            <h4 className="font-medium text-neutral-700 mb-2">
                              Rental Properties
                            </h4>
                            {inventory.rental.filter(
                              (p: any) => p.status === "Pending Approval"
                            ).length === 0 ? (
                              <p className="text-neutral-500 italic">
                                No pending rental properties
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Type
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Society
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Location
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Rent
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-neutral-200">
                                    {inventory.rental
                                      .filter(
                                        (property: any) =>
                                          property.status === "Pending Approval"
                                      )
                                      .map((property: any) => (
                                        <tr
                                          key={property.id}
                                          className="hover:bg-neutral-50"
                                        >
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {format(
                                              new Date(property.createdAt),
                                              "dd/MM/yyyy"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.type}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.society}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.roadLocation}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            ₹
                                            {property.rent.toLocaleString(
                                              "en-IN"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            <div className="flex space-x-2">
                                              <Button
                                                variant="text"
                                                size="sm"
                                                icon={
                                                  <Eye className="h-4 w-4" />
                                                }
                                                onClick={() =>
                                                  setShowPropertyDetails({
                                                    ...property,
                                                    category: "rental",
                                                  })
                                                }
                                              >
                                                View
                                              </Button>
                                              <Button
                                                variant="primary"
                                                size="sm"
                                                icon={
                                                  <Check className="h-4 w-4" />
                                                }
                                                onClick={() =>
                                                  handleApproveProperty(
                                                    property.id,
                                                    "rental"
                                                  )
                                                }
                                              >
                                                Approve
                                              </Button>
                                              <Button
                                                variant="danger"
                                                size="sm"
                                                icon={<X className="h-4 w-4" />}
                                                onClick={() =>
                                                  handleRejectProperty(
                                                    property.id,
                                                    "rental"
                                                  )
                                                }
                                              >
                                                Reject
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        id: "approved",
                        label: "Approved",
                        content: (
                          <div className="overflow-x-auto">
                            <h3 className="text-lg font-semibold mb-4">
                              Approved Properties
                            </h3>

                            {/* Resale Properties */}
                            <h4 className="font-medium text-neutral-700 mb-2">
                              Resale Properties
                            </h4>
                            {inventory.resale.filter(
                              (p: any) => p.status === "Approved"
                            ).length === 0 ? (
                              <p className="text-neutral-500 italic mb-6">
                                No approved resale properties
                              </p>
                            ) : (
                              <div className="mb-6 overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Type
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Society
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Location
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Price
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-neutral-200">
                                    {inventory.resale
                                      .filter(
                                        (property: any) =>
                                          property.status === "Approved"
                                      )
                                      .map((property: any) => (
                                        <tr
                                          key={property.id}
                                          className="hover:bg-neutral-50"
                                        >
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {format(
                                              new Date(property.createdAt),
                                              "dd/MM/yyyy"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.type}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.society}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.roadLocation}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            ₹
                                            {property.expectedPrice.toLocaleString(
                                              "en-IN"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            <Button
                                              variant="text"
                                              size="sm"
                                              icon={<Eye className="h-4 w-4" />}
                                              onClick={() =>
                                                setShowPropertyDetails({
                                                  ...property,
                                                  category: "resale",
                                                })
                                              }
                                            >
                                              View
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Rental Properties */}
                            <h4 className="font-medium text-neutral-700 mb-2">
                              Rental Properties
                            </h4>
                            {inventory.rental.filter(
                              (p: any) => p.status === "Approved"
                            ).length === 0 ? (
                              <p className="text-neutral-500 italic">
                                No approved rental properties
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Type
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Society
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Location
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Rent
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-neutral-200">
                                    {inventory.rental
                                      .filter(
                                        (property: any) =>
                                          property.status === "Approved"
                                      )
                                      .map((property: any) => (
                                        <tr
                                          key={property.id}
                                          className="hover:bg-neutral-50"
                                        >
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {format(
                                              new Date(property.createdAt),
                                              "dd/MM/yyyy"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.type}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.society}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.roadLocation}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            ₹
                                            {property.rent.toLocaleString(
                                              "en-IN"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            <Button
                                              variant="text"
                                              size="sm"
                                              icon={<Eye className="h-4 w-4" />}
                                              onClick={() =>
                                                setShowPropertyDetails({
                                                  ...property,
                                                  category: "rental",
                                                })
                                              }
                                            >
                                              View
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        id: "rejected",
                        label: "Rejected",
                        content: (
                          <div className="overflow-x-auto">
                            <h3 className="text-lg font-semibold mb-4">
                              Rejected Properties
                            </h3>

                            {/* Resale Properties */}
                            <h4 className="font-medium text-neutral-700 mb-2">
                              Resale Properties
                            </h4>
                            {inventory.resale.filter(
                              (p: any) => p.status === "Rejected"
                            ).length === 0 ? (
                              <p className="text-neutral-500 italic mb-6">
                                No rejected resale properties
                              </p>
                            ) : (
                              <div className="mb-6 overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Type
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Society
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Location
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Price
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-neutral-200">
                                    {inventory.resale
                                      .filter(
                                        (property: any) =>
                                          property.status === "Rejected"
                                      )
                                      .map((property: any) => (
                                        <tr
                                          key={property.id}
                                          className="hover:bg-neutral-50"
                                        >
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {format(
                                              new Date(property.createdAt),
                                              "dd/MM/yyyy"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.type}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.society}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.roadLocation}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            ₹
                                            {property.expectedPrice.toLocaleString(
                                              "en-IN"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            <div className="flex space-x-2">
                                              <Button
                                                variant="text"
                                                size="sm"
                                                icon={
                                                  <Eye className="h-4 w-4" />
                                                }
                                                onClick={() =>
                                                  setShowPropertyDetails({
                                                    ...property,
                                                    category: "resale",
                                                  })
                                                }
                                              >
                                                View
                                              </Button>
                                              <Button
                                                variant="primary"
                                                size="sm"
                                                icon={
                                                  <CheckCircle className="h-4 w-4" />
                                                }
                                                onClick={() =>
                                                  handleApproveProperty(
                                                    property.id,
                                                    "resale"
                                                  )
                                                }
                                              >
                                                Approve
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Rental Properties */}
                            <h4 className="font-medium text-neutral-700 mb-2">
                              Rental Properties
                            </h4>
                            {inventory.rental.filter(
                              (p: any) => p.status === "Rejected"
                            ).length === 0 ? (
                              <p className="text-neutral-500 italic">
                                No rejected rental properties
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Type
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Society
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Location
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Rent
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-neutral-200">
                                    {inventory.rental
                                      .filter(
                                        (property: any) =>
                                          property.status === "Rejected"
                                      )
                                      .map((property: any) => (
                                        <tr
                                          key={property.id}
                                          className="hover:bg-neutral-50"
                                        >
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {format(
                                              new Date(property.createdAt),
                                              "dd/MM/yyyy"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.type}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.society}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {property.roadLocation}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            ₹
                                            {property.rent.toLocaleString(
                                              "en-IN"
                                            )}
                                          </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            <div className="flex space-x-2">
                                              <Button
                                                variant="text"
                                                size="sm"
                                                icon={
                                                  <Eye className="h-4 w-4" />
                                                }
                                                onClick={() =>
                                                  setShowPropertyDetails({
                                                    ...property,
                                                    category: "rental",
                                                  })
                                                }
                                              >
                                                View
                                              </Button>
                                              <Button
                                                variant="primary"
                                                size="sm"
                                                icon={
                                                  <CheckCircle className="h-4 w-4" />
                                                }
                                                onClick={() =>
                                                  handleApproveProperty(
                                                    property.id,
                                                    "rental"
                                                  )
                                                }
                                              >
                                                Approve
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ),
                      },
                    ]}
                  />
                </Card>
              ),
            },
            {
              id: "users",
              label: "Users",
              content: (
                <Card>
                  <h3 className="text-lg font-semibold mb-4">
                    Registered Users
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Subscriptions
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {user.fullName}
                                  </div>
                                  <div className="text-sm text-neutral-500">
                                    RERA: {user.reraNumber}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {user.email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {user.phone}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {user.city}, {user.state}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {user.subscriptionLocations &&
                              user.subscriptionLocations.length > 0 ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success/10 text-success">
                              {user.subscriptionLocations.length} locations
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-600">
                              No subscriptions
                            </span>
                          )}
                        </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                              <Button
                                variant="text"
                                size="sm"
                                icon={<Eye className="h-4 w-4" />}
                                onClick={() => viewUserDetails(user)}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ),
            },
          ]}
        />
      </div>

      {/* User Details Modal */}
      {showUserModal && userDetails && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button
                className="text-neutral-500 hover:text-neutral-700"
                onClick={() => setShowUserModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-neutral-600 mb-2">
                    Personal Information
                  </h4>
                  <div className="bg-neutral-50 rounded-md p-4">
                    <div className="flex items-center mb-3">
                      <Users className="h-10 w-10 text-primary bg-primary/10 p-2 rounded-full mr-3" />
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {userDetails.fullName}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {userDetails.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Phone:</span>
                        <span className="font-medium text-neutral-900">
                          {userDetails.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">RERA Number:</span>
                        <span className="font-medium text-neutral-900">
                          {userDetails.reraNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Location:</span>
                        <span className="font-medium text-neutral-900">
                          {userDetails.city}, {userDetails.state}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Role:</span>
                        <span className="font-medium text-neutral-900">
                          {userDetails.isAdmin ? "Admin" : "User"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-600 mb-2">
                    Subscription Information
                  </h4>
                  <div className="bg-neutral-50 rounded-md p-4">
                    <div className="flex items-center mb-3">
                      <Briefcase className="h-10 w-10 text-accent bg-accent/10 p-2 rounded-full mr-3" />
                      <div>
                        <p className="font-semibold text-neutral-900">
                          Subscribed Locations
                        </p>
                        <p className="text-sm text-neutral-500">
                          {(userDetails.subscriptionLocations || []).length}{" "}
                          active subscriptions
                        </p>
                      </div>
                    </div>
                    {(userDetails.subscriptionLocations || []).length > 0 ? (
                      <div className="space-y-2">
                        {(userDetails.subscriptionLocations || []).map(
                          (location) => (
                            <div
                              key={location.id}
                              className="flex justify-between items-center p-2 bg-white rounded border border-neutral-200"
                            >
                              <span className="font-medium">
                                {location.name}
                              </span>
                              <span className="text-accent">
                                ₹{location.price.toLocaleString("en-IN")}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-neutral-500">
                        <p>No active subscriptions</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 flex justify-end">
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {showPropertyDetails && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Property Details</h3>
              <button
                className="text-neutral-500 hover:text-neutral-700"
                onClick={() => setShowPropertyDetails(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    showPropertyDetails.status === "Approved"
                      ? "bg-success/10 text-success"
                      : showPropertyDetails.status === "Rejected"
                      ? "bg-error/10 text-error"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {showPropertyDetails.status}
                </span>
                <span className="ml-2 text-sm text-neutral-500">
                  Created on{" "}
                  {format(
                    new Date(showPropertyDetails.createdAt),
                    "dd MMM yyyy"
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-600 mb-2">
                    Basic Information
                  </h4>
                  <div className="bg-neutral-50 rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Property Type:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Society:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.society}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Location:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.roadLocation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Station:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.station}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Zone:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.zone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Direct/Broker:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.directBroker}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Terrace/Gallery:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.terrace ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Cosmo:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.cosmo ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  {showPropertyDetails.category === "resale" && (
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-600 mb-2">
                        Resale Details
                      </h4>
                      <div className="bg-neutral-50 rounded-md p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">
                            Expected Price:
                          </span>
                          <span className="font-medium text-neutral-900">
                            ₹
                            {showPropertyDetails.expectedPrice.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Floor No:</span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.floorNo || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Flat No:</span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.flatNo || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {showPropertyDetails.category === "rental" && (
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-600 mb-2">
                        Rental Details
                      </h4>
                      <div className="bg-neutral-50 rounded-md p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Rent:</span>
                          <span className="font-medium text-neutral-900">
                            ₹{showPropertyDetails.rent.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Deposit:</span>
                          <span className="font-medium text-neutral-900">
                            ₹
                            {showPropertyDetails.deposit.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Furnishing:</span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.furnishing}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">
                            Available From:
                          </span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.availableFrom}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">
                            Property Age:
                          </span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.propertyAge} years
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Parking:</span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.parking}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-neutral-600 mb-2">
                    Contact Details
                  </h4>
                  <div className="bg-neutral-50 rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Contact Name:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.contactName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Contact Number:</span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.contactNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">
                        Connected Person:
                      </span>
                      <span className="font-medium text-neutral-900">
                        {showPropertyDetails.connectedPerson}
                      </span>
                    </div>
                  </div>

                  {showPropertyDetails.category === "rental" && (
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-600 mb-2">
                        Building Details
                      </h4>
                      <div className="bg-neutral-50 rounded-md p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Building No:</span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.buildingNo || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Floor No:</span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.floorNo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">
                            Total Floors:
                          </span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.totalFloors}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Wing:</span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.wing || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Flat No:</span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.flatNo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Landmark:</span>
                          <span className="font-medium text-neutral-900">
                            {showPropertyDetails.landmark || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {showPropertyDetails.category === "rental" && (
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-600 mb-2">
                        Amenities
                      </h4>
                      <div className="bg-neutral-50 rounded-md p-4">
                        {!showPropertyDetails.amenities ||
                        showPropertyDetails.amenities.length === 0 ? (
                          <p className="text-neutral-500 text-sm">
                            No amenities specified
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {showPropertyDetails.amenities.map(
                              (amenity: string) => (
                                <div
                                  key={amenity}
                                  className="flex items-center"
                                >
                                  <Check className="h-4 w-4 text-success mr-2" />
                                  <span className="text-sm">{amenity}</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 flex justify-between">
              <div>
                {showPropertyDetails.status === "Pending Approval" && (
                  <>
                    <Button
                      variant="danger"
                      className="mr-2"
                      icon={<X className="h-4 w-4 mr-1" />}
                      onClick={() => {
                        handleRejectProperty(
                          showPropertyDetails.id,
                          showPropertyDetails.category
                        );
                        setShowPropertyDetails(null);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      icon={<Check className="h-4 w-4 mr-1" />}
                      onClick={() => {
                        handleApproveProperty(
                          showPropertyDetails.id,
                          showPropertyDetails.category
                        );
                        setShowPropertyDetails(null);
                      }}
                    >
                      Approve
                    </Button>
                  </>
                )}
                {showPropertyDetails.status === "Rejected" && (
                  <Button
                    variant="primary"
                    icon={<Check className="h-4 w-4 mr-1" />}
                    onClick={() => {
                      handleApproveProperty(
                        showPropertyDetails.id,
                        showPropertyDetails.category
                      );
                      setShowPropertyDetails(null);
                    }}
                  >
                    Approve
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPropertyDetails(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
