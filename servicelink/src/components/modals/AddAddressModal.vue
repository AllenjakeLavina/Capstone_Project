<template>
  <div 
    v-if="showModal" 
    :class="embedded ? 'embedded-wrapper' : 'modal-overlay'"
  >
    <div :class="embedded ? 'embedded-modal' : 'modal'">
      <div :class="['modal-header', { 'embedded-header': embedded }]">
        <h2>Add New Address</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitAddress" class="address-form">
          <div class="form-group">
            <label for="addressType">Address Type</label>
            <select id="addressType" v-model="addressForm.type" required>
              <option value="HOME">Home</option>
              <option value="WORK">Work</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="addressLine1">Street Address</label>
            <input id="addressLine1" v-model="addressForm.addressLine1" required />
          </div>

          <div class="form-group">
            <label for="barangay">Barangay</label>
            <select id="barangay" v-model="addressForm.addressLine2" required>
              <option disabled value="">Select Barangay</option>
              <option
                v-for="barangay in barangays"
                :key="barangay"
                :value="barangay"
              >
                {{ barangay }}
              </option>
            </select>
          </div>
          
          <div class="form-group checkbox">
            <input 
              id="isDefault"
              type="checkbox" 
              v-model="addressForm.isDefault"
            />
            <label for="isDefault">Set as default address</label>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-cancel" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn btn-confirm" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add Address' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { clientService } from '@/services/apiService';
import Swal from 'sweetalert2';

export default {
  name: 'AddAddressModal',
  props: {
    showModal: {
      type: Boolean,
      default: false
    },
    embedded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'addressAdded'],
  setup(props, { emit }) {
    const isSubmitting = ref(false);
    const defaultCity = 'Olongapo City';
    const defaultState = 'Zambales';
    const defaultPostalCode = '2200';
    const defaultCountry = 'Philippines';

    const barangays = [
      'Barangay Asinan',
      'Barangay Banicain',
      'Barangay Barretto',
      'Barangay East Bajac-Bajac',
      'Barangay East Tapinac',
      'Barangay Gordon Heights',
      'Barangay Kalaklan',
      'Barangay Kalalake',
      'Barangay New Cabalan',
      'Barangay New Ilalim',
      'Barangay New Kababae',
      'Barangay New Kalalake',
      'Barangay Old Cabalan',
      'Barangay Pag-Asa',
      'Barangay Sta. Rita',
      'Barangay West Bajac-Bajac',
      'Barangay West Tapinac'
    ];
    const addressForm = ref({
      type: 'HOME',
      addressLine1: '',
      addressLine2: '',
      isDefault: false
    });

    const submitAddress = async () => {
      if (!addressForm.value.addressLine1 || !addressForm.value.addressLine2) {
        await Swal.fire({
          title: 'Incomplete Details',
          text: 'Please fill in the street address and select a barangay.',
          icon: 'warning',
          confirmButtonColor: '#27ae60'
        });
        return;
      }

      isSubmitting.value = true;

      try {
        const response = await clientService.addAddress({
          type: addressForm.value.type,
          addressLine1: addressForm.value.addressLine1,
          addressLine2: addressForm.value.addressLine2,
          city: defaultCity,
          state: defaultState,
          postalCode: defaultPostalCode,
          country: defaultCountry,
          isDefault: addressForm.value.isDefault
        });
        
        if (response.success) {
          // Reset form
          addressForm.value = {
            type: 'HOME',
            addressLine1: '',
            addressLine2: '',
            isDefault: false
          };
          
          emit('addressAdded');
          emit('close');

          await Swal.fire({
            title: 'Address Added!',
            text: 'Your new address has been saved.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        } else {
          await Swal.fire({
            title: 'Add Failed',
            text: response.message || 'Failed to add address. Please try again.',
            icon: 'error',
            confirmButtonColor: '#27ae60'
          });
        }
      } catch (err) {
        console.error('Error adding address:', err);
        await Swal.fire({
          title: 'Add Failed',
          text: err.message || 'Failed to add address. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#27ae60'
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      addressForm,
      barangays,
      isSubmitting,
      submitAddress
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.embedded-wrapper {
  position: static;
  width: 100%;
  height: auto;
  background: transparent;
  display: block;
  margin-top: 10px;
}

.modal {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 420px;
  max-height: 85dvh;
  max-height: 85vh; /* Fallback for older browsers */
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.embedded-modal {
  background: white;
  border-radius: 10px;
  width: 100%;
  max-width: none;
  max-height: none;
  overflow: visible;
  box-shadow: none;
  border: 1px solid #e0e0e0;
}

.embedded-header {
  background: #f8f9fa;
  color: #333;
  border-radius: 10px 10px 0 0;
}

.embedded-header h2 {
  font-size: 1.05rem;
}

.embedded-header .close-btn {
  color: #555;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-radius: 10px 10px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 20px;
}

.address-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.checkbox input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.checkbox label {
  margin: 0;
  font-weight: 500;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e0e0e0;
}

.btn-cancel:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.btn-confirm {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #45a049, #3d8b40);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style> 