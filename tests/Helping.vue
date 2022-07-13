<template>
  <div class="container home">
      <div class="row">
        <h3>Enter Employee Number or Name to Search</h3>
        <div class="spacer"></div>
        <form @submit.prevent="submitSearchForm" @reset="resetSearchForm">
          <div class="row">      
              <div class="col-3">
                <label for="Employee Name"></label>
                <input type="text" v-model="mySearch.personName" placeholder="Enter Employee Name"/>
              </div>
              <div class="col-3">
                <label for="Employee Number"></label>
                <input type="text" v-model="mySearch.personNbr" placeholder="Enter Employee Number"/>
              </div>
              <div class="col-3">
                <button type="submit" class="btn btn-primary" :disabled="mySearch.personNbr==='' && mySearch.personName ===''"> Search</button>
                <button type="reset" class="btn btn-secondary" style="margin-left:10px"> Reset </button>
              </div>                          
          </div>
        </form> 
        <div class="row">
          <div v-if="isEditable" class="col-3">
              <button data-test="new-employee" type="button" class="btn btn-primary" @click="addNewPerson"> Add New Employee</button>
          </div>
        </div>             
      </div> 
      <div class="spacer"></div>

      <div v-if="isLoading">
          <div class="spinner-border m-5" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
      </div>
      <div v-else>
          <div v-if="personData.person.number !== '' " class="row">
            <div class="row">
                <div class="col-4">
                  <label for="Employee Name">Employee Name</label>
                  <input type="text" v-model="personData.person.name" />
                </div>
                <div class="col-4">
                  <label for="Employee#">Employee Number</label>
                  <input type="text" v-model="personData.person.number" readonly/>
                </div>
                <div class="col-4">
                  <label for="Employee Dept">Employee Department</label>
                  <input type="text" v-model="personData.person.dept" readonly/>
                </div>
            </div>
            <div class="spacer"></div>
            <div class="row">
                <div class="col-4">
                  <label for="Employee Address1">Address1</label>
                  <input type="text" v-model="personData.person.address1"/>
                </div>
                <div class="col-4">
                  <label for="Employee Addres2">Address2</label>
                  <input type="text" v-model="personData.person.address2"/>
                </div>
                <div class="col-4">
                  <label for="Employee email">Email</label>
                  <input type="text" v-model="personData.person.email"/>
                </div>
            </div>
            <div class="spacer"></div>
            <div v-if="isEditable" class="row">
                <div style="width:50%; margin:0 auto;">
                  <button type="button" class="btn btn-primary"> Save</button>
                  <button type="button" class="btn btn-secondary" style="margin-left:10px" @click="closeEditBox"> Close </button>
                </div>
            </div>

          </div>
          <div v-else class="alert alert-info" role="alert">Search for results or Click Add New Employee to add a new record</div>

        </div>   
  </div>   
   
</template>

<script>
import { computed, reactive, ref, inject } from "vue"

export default {

  setup() {
    const myUserDeptAndRole = inject('userDeptAndRole') //this is actually injected from App.vue

    const mySearch = reactive({ personName: "", personNbr : ""})

    const person = {name:'', number:'', email:'', dept:'', address1:'', address2:''}

    let personData = reactive({person})
    let personDataCache = reactive({person})

    const addNewPerson = () => {
      personData.person.number ='new'
      personData.person.dept = myUserDeptAndRole.value.dept
      personData.person.name
      ,personData.person.email, personData.person.address1, personData.person.address2 = ''

      console.log(personData.person)
    }

    const isEditable = computed(() => {
      if(myUserDeptAndRole.value) {//only compute if myUserDeptAndRole is available
        
        if(personData.person.number != '' && myUserDeptAndRole.value.dept != personData.person.dept) return false //you can only update your department's people
        if(personData.person.name.startsWith('DNU')) return false

        return myUserDeptAndRole.value.roles.startsWith('WRITE') ? true :false
      }

      return false
    })

    const closeEditBox = () => {
      personData.person.number = '' //implement logic later
    }

    let isLoading = ref(false)
    const submitSearchForm = () =>{
      isLoading.value = true
      //actual implementation is axios >> Object.assign
      //axios.get(URL_BAST+'/'+personData.person.number)

      const srch_person = {name:'Michael Jackson', number:'123456', email:'mjackson@abc.com', dept:'Communications', address1:'123 Basic Lane', address2:'Apt 30'}
      Object.assign(personData.person, srch_person)
      isLoading.value = false
    }

    return {
      mySearch , personData, personDataCache
      ,addNewPerson, submitSearchForm
      ,isEditable, isLoading , closeEditBox
    }
  }
}
</script>

<style scoped>
.home {
  padding: 10px;
  min-height: 320px;
}
.spacer {
  padding: 10px;
}
.btn-primary:disabled {
  opacity: 0.35;
}
input[type="text"], textarea {
  background-color : white
}
input:read-only {
  cursor: not-allowed;
  background-color: rgb(221, 215, 215);
}
</style>