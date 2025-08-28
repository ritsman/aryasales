import React, { useState, useEffect } from 'react';
import { Save, Loader2, Package, IndianRupee, Hash, Calendar, FileText, Settings, Layers, Boxes, Type, Image, X } from 'lucide-react';
import config from "../config";
export default function ProductForm() {
  // Form state
  const [formData, setFormData] = useState({
    style_number: '',
    style_name: '',
    season: '',
    hsn_code: '',
    cost: '',
    mrp: '',
    size_set: '',
    process_group: '',
    item_bom: '',
    picture: null
  });

  // API data state
  const [selectOptions, setSelectOptions] = useState({
    size_sets: [],
    process_groups: [],
    item_boms: []
  });

  // Loading states
  const [loading, setLoading] = useState({
    size_sets: false,
    process_groups: false,
    item_boms: false,
    form: false
  });

  // Error states
  const [errors, setErrors] = useState({});
  
  // Picture preview state
  const [picturePreview, setPicturePreview] = useState(null);

  // Fetch data for select elements
  useEffect(() => {
    const fetchSelectData = async () => {
      // Set all loading states to true
      setLoading(prev => ({ 
        ...prev, 
        size_sets: true, 
        process_groups: true, 
        item_boms: true 
      }));

      try {
        // Fetch all APIs simultaneously using Promise.all
        //const [sizeSetResponse, processGroupResponse, itemBomResponse] = await Promise.all([
          const [sizeSetResponse] = await Promise.all([
          //fetch('/api/size-sets').catch(err => ({ error: err })),
          fetch(`${config.API_URL}/api/master/getSizes`).catch(err => ({ error: err })),
          //fetch('/api/process-groups').catch(err => ({ error: err })),
          //fetch('/api/item-boms').catch(err => ({ error: err }))
        ]);

        // Process Size Sets
        let sizeSetData = [];
        
        if (sizeSetResponse.error) {
          console.error('Error fetching size sets:', sizeSetResponse.error);
          // Mock data for demo purposes
          sizeSetData = [
            { id: 1, name: 'Small Set', value: 'small_set' },
            { id: 2, name: 'Medium Set', value: 'medium_set' },
            { id: 3, name: 'Large Set', value: 'large_set' },
            { id: 4, name: 'XL Set', value: 'xl_set' }
          ];
        } else if (sizeSetResponse.ok) {
    const jsonData = await sizeSetResponse.json();
    console.log('Size Set Data:', jsonData);
    sizeSetData = jsonData.map(item=>({
      id: item._id,
      name: item.sizeName,
      value: item.sizeName
    })); // Assign to your state laters
    //sizeSetData=[{ id: 1, name: 'Small Set2', value: 'small_set' }]
        }

        // // Process Process Groups
         let processGroupData = [{ id: 1, name: 'Manufacturing', value: 'manufacturing' }];
        // if (processGroupResponse.error) {
        //   console.error('Error fetching process groups:', processGroupResponse.error);
        //   // Mock data for demo purposes
        //   processGroupData = [
        //     { id: 1, name: 'Manufacturing', value: 'manufacturing' },
        //     { id: 2, name: 'Quality Control', value: 'quality_control' },
        //     { id: 3, name: 'Packaging', value: 'packaging' },
        //     { id: 4, name: 'Distribution', value: 'distribution' }
        //   ];
        // } else {
        //   processGroupData = await processGroupResponse.json();
        // }

        // // Process Item BOMs
         let itemBomData = [{ id: 1, name: 'Standard BOM', value: 'standard_bom' }];
        // if (itemBomResponse.error) {
        //   console.error('Error fetching item BOMs:', itemBomResponse.error);
        //   // Mock data for demo purposes
        //   itemBomData = [
        //     { id: 1, name: 'Standard BOM', value: 'standard_bom' },
        //     { id: 2, name: 'Premium BOM', value: 'premium_bom' },
        //     { id: 3, name: 'Economy BOM', value: 'economy_bom' },
        //     { id: 4, name: 'Custom BOM', value: 'custom_bom' }
        //   ];
        // } else {
        //   itemBomData = await itemBomResponse.json();
        // }

        // Update all select options at once
        setSelectOptions({
          size_sets: sizeSetData || [{ id: 1, name: 'Small Set', value: 'small_set' }],
          process_groups: processGroupData || [ { id: 1, name: 'Manufacturing', value: 'manufacturing' },],
          item_boms: itemBomData || [{ id: 1, name: 'Standard BOM', value: 'standard_bom' },]
        });

      } catch (error) {
        console.error('Error fetching select data:', error);
        // Set mock data for all selects in case of general error
        setSelectOptions({
          size_sets: [
            { id: 1, name: 'Small Set33', value: 'small_set' },
            { id: 2, name: 'Medium Set', value: 'medium_set' },
            { id: 3, name: 'Large Set', value: 'large_set' },
            { id: 4, name: 'XL Set', value: 'xl_set' }
          ],
          process_groups: [
            { id: 1, name: 'Manufacturing', value: 'manufacturing' },
            { id: 2, name: 'Quality Control', value: 'quality_control' },
            { id: 3, name: 'Packaging', value: 'packaging' },
            { id: 4, name: 'Distribution', value: 'distribution' }
          ],
          item_boms: [
            { id: 1, name: 'Standard BOM', value: 'standard_bom' },
            { id: 2, name: 'Premium BOM', value: 'premium_bom' },
            { id: 3, name: 'Economy BOM', value: 'economy_bom' },
            { id: 4, name: 'Custom BOM', value: 'custom_bom' }
          ]
        });
      } finally {
        // Set all loading states to false
        setLoading(prev => ({ 
          ...prev, 
          size_sets: false, 
          process_groups: false, 
          item_boms: false 
        }));
      }
    };

    fetchSelectData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          picture: 'Please select a valid image file (JPG, PNG, GIF)'
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          picture: 'File size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        picture: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.picture) {
        setErrors(prev => ({
          ...prev,
          picture: ''
        }));
      }
    }
  };

  // Remove picture
  const removePicture = () => {
    setFormData(prev => ({
      ...prev,
      picture: null
    }));
    setPicturePreview(null);
    // Reset file input
    const fileInput = document.getElementById('picture-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.style_number.trim()) {
      newErrors.style_number = 'Style number is required';
    }

    if (!formData.style_name.trim()) {
      newErrors.style_name = 'Style name is required';
    }

    if (!formData.season.trim()) {
      newErrors.season = 'Season is required';
    }

    if (!formData.hsn_code.trim()) {
      newErrors.hsn_code = 'HSN Code is required';
    }

    if (!formData.cost.trim()) {
      newErrors.cost = 'Cost is required';
    } else if (isNaN(formData.cost) || parseFloat(formData.cost) <= 0) {
      newErrors.cost = 'Cost must be a valid positive number';
    }

    if (!formData.mrp.trim()) {
      newErrors.mrp = 'MRP is required';
    } else if (isNaN(formData.mrp) || parseFloat(formData.mrp) <= 0) {
      newErrors.mrp = 'MRP must be a valid positive number';
    }

    if (!formData.size_set) {
      newErrors.size_set = 'Size set is required';
    }

    if (!formData.process_group) {
      newErrors.process_group = 'Process group is required';
    }

    if (!formData.item_bom) {
      newErrors.item_bom = 'Item BOM is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(prev => ({ ...prev, form: true }));

    try {
      const form = new FormData();
    form.append('style_number', formData.style_number);
    form.append('style_name', formData.style_name);
    form.append('season', formData.season);
    form.append('hsn_code', formData.hsn_code);
    form.append('cost', formData.cost);
    form.append('mrp', formData.mrp);
    form.append('size_set', formData.size_set);
    form.append('process_group', formData.process_group);
    form.append('item_bom', formData.item_bom);

    // Append picture
    if (formData.picture) {
      form.append('picture', formData.picture); // 'picture' should match multer's field name
    }

      // Replace with your actual API endpoint
      //const response = await fetch('http://192.168.29.132:3025/api/products', {
      const response = await fetch(`${config.APIPOST_URL}/api/products`, {
        method: 'POST',
        
        body: form,
      });
        console.log('Form data to be submitted:', form);
      if (response.ok) {
        alert('Product saved successfully!');
        // Reset form
        setFormData({
          style_number: '',
          style_name: '',
          season: '',
          hsn_code: '',
          cost: '',
          mrp: '',
          size_set: '',
          process_group: '',
          item_bom: '',
          picture: null
        });
        setPicturePreview(null);
        // Reset file input
        const fileInput = document.getElementById('picture-upload');
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"style={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 10 }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-white mr-3" />
              <h2 className="text-2xl font-bold text-white">Product Information</h2>
            </div>
            <p className="text-blue-100 mt-1">Fill in the product details below</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Style Number */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 mr-2" />
                Style Number
              </label>
              <input
                type="text"
                name="style_number"
                value={formData.style_number}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.style_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter style number"
              />
              {errors.style_number && (
                <p className="mt-1 text-sm text-red-600">{errors.style_number}</p>
              )}
            </div>

            {/* Style Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4 mr-2" />
                Style Name
              </label>
              <input
                type="text"
                name="style_name"
                value={formData.style_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.style_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter style name"
              />
              {errors.style_name && (
                <p className="mt-1 text-sm text-red-600">{errors.style_name}</p>
              )}
            </div>

            {/* Picture Upload */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 mr-2" />
                Product Picture
              </label>
              
              {!picturePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Add a product picture</p>
                  <p className="text-xs text-gray-500 mb-4">JPG, PNG, GIF up to 5MB</p>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    <Image className="w-4 h-4 mr-2" />
                    Choose Picture
                    <input
                      id="picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <img
                        src={picturePreview}
                        alt="Product preview"
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{formData.picture?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(formData.picture?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="mt-2 flex space-x-2">
                          <label className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 cursor-pointer transition-colors">
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={removePicture}
                            className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.picture && (
                <p className="mt-2 text-sm text-red-600">{errors.picture}</p>
              )}
            </div>

            {/* Season */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Season
              </label>
              <input
                type="text"
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.season ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter season (e.g., Spring 2024)"
              />
              {errors.season && (
                <p className="mt-1 text-sm text-red-600">{errors.season}</p>
              )}
            </div>

            {/* HSN Code */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                HSN Code
              </label>
              <input
                type="text"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.hsn_code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter HSN code"
              />
              {errors.hsn_code && (
                <p className="mt-1 text-sm text-red-600">{errors.hsn_code}</p>
              )}
            </div>

            {/* Cost and MRP Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cost */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Cost
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.cost ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                )}
              </div>

              {/* MRP */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  MRP
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.mrp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.mrp && (
                  <p className="mt-1 text-sm text-red-600">{errors.mrp}</p>
                )}
              </div>
            </div>

            {/* Size Set */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Boxes className="w-4 h-4 mr-2" />
                Size Set
              </label>
              <select
                name="size_set"
                value={formData.size_set}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.size_set ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading.size_sets}
              >
                <option value="">
                  {loading.size_sets ? 'Loading size sets...' : 'Select size set'}
                </option>
                {selectOptions.size_sets.map(option => (
                  <option key={option.id} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
              {loading.size_sets && (
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Loading size sets...
                </div>
              )}
              {errors.size_set && (
                <p className="mt-1 text-sm text-red-600">{errors.size_set}</p>
              )}
            </div>

            {/* Process Group */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Settings className="w-4 h-4 mr-2" />
                Process Group
              </label>
              <select
                name="process_group"
                value={formData.process_group}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.process_group ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading.process_groups}
              >
                <option value="">
                  {loading.process_groups ? 'Loading process groups...' : 'Select process group'}
                </option>
                {selectOptions.process_groups.map(option => (
                  <option key={option.id} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
              {loading.process_groups && (
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Loading process groups...
                </div>
              )}
              {errors.process_group && (
                <p className="mt-1 text-sm text-red-600">{errors.process_group}</p>
              )}
            </div>

            {/* Item BOM */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Layers className="w-4 h-4 mr-2" />
                Item BOM
              </label>
              <select
                name="item_bom"
                value={formData.item_bom}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.item_bom ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading.item_boms}
              >
                <option value="">
                  {loading.item_boms ? 'Loading item BOMs...' : 'Select item BOM'}
                </option>
                {selectOptions.item_boms.map(option => (
                  <option key={option.id} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
              {loading.item_boms && (
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Loading item BOMs...
                </div>
              )}
              {errors.item_bom && (
                <p className="mt-1 text-sm text-red-600">{errors.item_bom}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                onClick={() => {
                  setFormData({
                    style_number: '',
                    style_name: '',
                    season: '',
                    hsn_code: '',
                    cost: '',
                    mrp: '',
                    size_set: '',
                    process_group: '',
                    item_bom: '',
                    picture: null
                  });
                  setPicturePreview(null);
                  setErrors({});
                  // Reset file input
                  const fileInput = document.getElementById('picture-upload');
                  if (fileInput) {
                    fileInput.value = '';
                  }
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading.form}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                onClick={handleSubmit}
              >
                {loading.form ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}