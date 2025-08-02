<template>
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
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
            <label for="addressLine1">Address Line 1*</label>
            <input 
              id="addressLine1" 
              v-model="addressForm.addressLine1" 
              required 
              placeholder="Street address, apartment, suite, etc."
            />
          </div>
          
          <div class="form-group">
            <label for="addressLine2">Address Line 2</label>
            <input 
              id="addressLine2" 
              v-model="addressForm.addressLine2" 
              placeholder="Apartment, suite, unit, etc. (optional)"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="city">City*</label>
              <input id="city" v-model="addressForm.city" required />
            </div>
            <div class="form-group">
              <label for="state">State/Province*</label>
              <input id="state" v-model="addressForm.state" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="postalCode">Postal Code*</label>
              <input id="postalCode" v-model="addressForm.postalCode" required />
            </div>
            <div class="form-group">
              <label for="country">Country*</label>
              <input id="country" v-model="addressForm.country" required />
            </div>
          </div>
          
          <div class="form-group checkbox">
            <label>
              <input 
                type="checkbox" 
                v-model="addressForm.isDefault"
              />
              Set as default address
            </label>
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

export default {
  name: 'AddAddressModal',
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'addressAdded'],
  setup(props, { emit }) {
    const isSubmitting = ref(false);
    const addressForm = ref({
      type: 'HOME',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Philippines',
      isDefault: false
    });

    const submitAddress = async () => {
      if (!addressForm.value.addressLine1 || !addressForm.value.city || 
          !addressForm.value.state || !addressForm.value.postalCode || 
          !addressForm.value.country) {
        alert('Please fill in all required fields');
        return;
      }

      isSubmitting.value = true;

      try {
        const response = await clientService.addAddress(addressForm.value);
        
        if (response.success) {
          // Reset form
          addressForm.value = {
            type: 'HOME',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Philippines',
            isDefault: false
          };
          
          emit('addressAdded');
          emit('close');
        } else {
          alert('Failed to add address: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error adding address:', err);
        alert('Failed to add address. Please try again later.');
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      addressForm,
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

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
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
  padding: 24px;
}

.address-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
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
  gap: 16px;
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
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
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