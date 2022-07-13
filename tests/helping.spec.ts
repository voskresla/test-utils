import { mount } from '../src'
import { expect, it, describe } from 'vitest'
import Helping from './Helping.vue'
import { ref } from 'vue'

describe('permission to add a new employee', () => {
  it('can edit', () => {
    const wrapper = mount(Helping, {
      global: {
        provide: {
          userDeptAndRole: ref({
            empl_name: 'tester',
            dept: 'abc',
            roles: 'READ_ROLE'
          })
        }
      }
    })

    expect(wrapper.find('[data-test="new-employee"]').exists()).toBe(false)
  })

  it('cannot edit', () => {
    const wrapper = mount(Helping, {
      global: {
        provide: {
          userDeptAndRole: ref({
            empl_name: 'tester',
            dept: 'abc',
            roles: 'WRITE_ROLE, READ_ROLE'
          })
        }
      }
    })

    expect(wrapper.find('[data-test="new-employee"]').exists()).toBe(true)
  })
})
