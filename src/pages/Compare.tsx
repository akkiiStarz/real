import { useState, useEffect, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Button from "../components/ui/Button";

interface Property {
  id: string;
  society: string;
  roadLocation: string;
  type: string;
  expectedPrice: number;
  contactName: string;
  contactNumber: string;
  [key: string]: any;
}

const Compare = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Expect selectedProperties passed via location state
  const selectedProperties: Property[] = location.state?.selectedProperties || [];

  // Local state for editable properties data
  const [propertiesData, setPropertiesData] = useState<Property[]>([]);

  useEffect(() => {
    // Initialize editable data from selectedProperties
    setPropertiesData(
      selectedProperties.map((prop) => ({
        ...prop,
        // Add any additional editable fields if needed
      }))
    );
  }, [selectedProperties]);

  if (selectedProperties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No properties selected for comparison.</p>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
    );
  }

  // Handler for editable field changes
  const handleChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setPropertiesData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  // Pricing formula example: calculate price for 1 BHK based on 2 BHK price
  // For simplicity, assume price for 1 BHK = (expectedPrice for 2 BHK) * 0.8
  // This can be adjusted as per actual formula requirements

  // Close compare page and return to dashboard
  const handleClose = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Compare Properties</h2>
          <button
            className="text-neutral-500 hover:text-neutral-700"
            onClick={handleClose}
            aria-label="Close compare page"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 table-auto">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Property Detail
                </th>
                {propertiesData.map((_, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Property {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                  Society
                </td>
                {propertiesData.map((property, index) => (
                  <td key={property.id} className="px-4 py-3 text-center">
                    <input
                      type="text"
                      value={property.society || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(index, "society", e.target.value)
                      }
                      className="border border-neutral-300 rounded px-2 py-1 w-full"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                  Location
                </td>
                {propertiesData.map((property, index) => (
                  <td key={property.id} className="px-4 py-3 text-center">
                    <input
                      type="text"
                      value={property.roadLocation || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(index, "roadLocation", e.target.value)
                      }
                      className="border border-neutral-300 rounded px-2 py-1 w-full"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                  Type
                </td>
                {propertiesData.map((property, index) => (
                  <td key={property.id} className="px-4 py-3 text-center">
                    <select
                      value={property.type || ""}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        const newType = e.target.value;
                        handleChange(index, "type", newType);

                        // Update price based on new BHK type using formula
                        const basePrice = property.expectedPrice || 0;
                        let newPrice = basePrice;

                        // Example formula: price scales by BHK type
                        // Extract numeric part of BHK type, e.g. "2.5 BHK" -> 2.5
                        const bhkNumber = parseFloat(newType);
                        if (!isNaN(bhkNumber)) {
                          // Assume base price corresponds to original BHK type number
                          const originalBhkNumber = parseFloat(property.type) || 1;
                          newPrice = Math.round((basePrice / originalBhkNumber) * bhkNumber);
                        }

                        handleChange(index, "expectedPrice", newPrice);
                      }}
                      className="border border-neutral-300 rounded px-2 py-1 w-full"
                    >
                      <option value="1 BHK">1 BHK</option>
                      <option value="1.5 BHK">1.5 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="2.5 BHK">2.5 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="3.5 BHK">3.5 BHK</option>
                      <option value="4 BHK">4 BHK</option>
                      <option value="5 BHK">5 BHK</option>
                    </select>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                  Price
                </td>
                {propertiesData.map((property, index) => {
                  return (
                    <td
                      key={property.id}
                      className="px-4 py-3 text-center font-semibold"
                    >
                      <input
                        type="number"
                        value={property.expectedPrice || 0}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleChange(index, "expectedPrice", Number(e.target.value))
                        }
                        className="border border-neutral-300 rounded px-2 py-1 w-full"
                      />
                    </td>
                  );
                })}
              </tr>
              {/* Add other editable rows as needed */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                  Name
                </td>
                {propertiesData.map((property) => (
                  <td
                    key={property.id}
                    className="px-4 py-3 text-center text-neutral-900"
                  >
                    {property.contactName || "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                  Contact
                </td>
                {propertiesData.map((property) => (
                  <td
                    key={property.id}
                    className="px-4 py-3 text-center text-neutral-900"
                  >
                    {property.contactNumber || "N/A"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Compare;
