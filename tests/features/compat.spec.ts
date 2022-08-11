import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as mockVue from '@vue/compat'
import { mount } from '../../src'

vi.mock('vue', () => mockVue)

const { configureCompat, extend, defineComponent, h, ref, onMounted } = mockVue

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const TestAsync = defineComponent({
  template: '<div><div>{{ mountText }}</div><div>{{ asyncText }}</div></div>',

  props: ['done'],

  setup({ done }) {
    const mountText = ref()
    const asyncText = ref()

    onMounted(() => {
      mountText.value = 'mounted'
    })

    sleep(0).then(() => {
      asyncText.value = 'async'
      done?.()
    })

    return {
      mountText,
      asyncText
    }
  }
})

describe('bug repro', () => {
  beforeEach(() => {
    configureCompat({ MODE: 2 })
  })

  it('should show onMount text', () => {
    return new Promise<void>((done) => {
      const wrapper = mount(TestAsync)
      wrapper.vm.$nextTick(() => {
        expect(wrapper.html()).toMatch('mounted')
        done()
      })
    })
  })

  it('should show async text', async () => {
    let renderedAsyncResolve
    const renderedAsync = new Promise(
      (resolve) => (renderedAsyncResolve = resolve)
    )

    const wrapper = mount(TestAsync, {
      propsData: { done: renderedAsyncResolve }
    })

    await renderedAsync
    expect(wrapper.html()).toMatch('async')
  })

  it('should show async text with nextTick', () => {
    /* eslint-disable no-async-promise-executor */
    return new Promise<void>(async (done) => {
      let renderedAsyncResolve
      const renderedAsync = new Promise(
        (resolve) => (renderedAsyncResolve = resolve)
      )

      const wrapper = mount(TestAsync, {
        props: { done: renderedAsyncResolve }
      })

      await renderedAsync
      wrapper.vm.$nextTick(() => {
        expect(wrapper.html()).toMatch('async')
        done()
      })
    })
  })
})

describe('@vue/compat build', () => {
  describe.each(['suppress-warning', false])(
    'when RENDER_FUNCTION compat is %p',
    (RENDER_FUNCTION) => {
      beforeEach(() => {
        configureCompat({ MODE: 3, RENDER_FUNCTION })
      })

      it('renders default slot content when renderStubDefaultSlot is true', () => {
        const Foo = { template: '<div><slot></slot></div>' }
        const Component = {
          components: { Foo },
          template: '<foo>test</foo>'
        }

        const wrapper = mount(Component, {
          global: {
            stubs: { Foo: true },
            renderStubDefaultSlot: true
          }
        })

        expect(wrapper.html()).toBe('<foo-stub>test</foo-stub>')
      })

      it('correctly renders transition', () => {
        const Component = defineComponent({
          template: '<transition><div class="hello"></div></transition>'
        })
        const wrapper = mount(Component)

        expect(wrapper.find('.hello').exists()).toBe(true)
      })
    }
  )

  it('finds components declared with legacy Vue.extend', () => {
    configureCompat({ MODE: 3, GLOBAL_EXTEND: 'suppress-warning' })

    const LegacyComponent = extend({
      template: '<div>LEGACY</div>'
    })

    const Component = defineComponent({
      components: {
        LegacyComponent
      },
      template: '<div><legacy-component /></div>'
    })
    const wrapper = mount(Component)

    expect(wrapper.findComponent(LegacyComponent).exists()).toBe(true)
  })

  it('correctly mounts legacy functional component', () => {
    configureCompat({ MODE: 3, COMPONENT_FUNCTIONAL: 'suppress-warning' })

    const Component = defineComponent({
      functional: true,
      render: () => h('div', 'test')
    })
    const wrapper = mount(Component)

    expect(wrapper.html()).toBe('<div>test</div>')
  })

  it('does not stub root legacy functional component when shallow', () => {
    configureCompat({
      MODE: 3,
      GLOBAL_EXTEND: 'suppress-warning',
      COMPONENT_FUNCTIONAL: 'suppress-warning'
    })

    const Foo = {
      name: 'Foo',
      functional: true,
      render: () => h('div', 'test')
    }
    const wrapper = mount(Foo, { shallow: true })

    expect(wrapper.html()).toBe('<div>test</div>')
  })

  it('correctly mounts legacy functional component wrapped in Vue.extend', () => {
    configureCompat({
      MODE: 3,
      GLOBAL_EXTEND: 'suppress-warning',
      COMPONENT_FUNCTIONAL: 'suppress-warning'
    })

    const Component = extend({
      functional: true,
      render: () => h('div', 'test')
    })
    const wrapper = mount(Component)

    expect(wrapper.html()).toBe('<div>test</div>')
  })

  it('correctly stubs legacy component wrapped in Vue.extend', () => {
    configureCompat({
      MODE: 3,
      GLOBAL_EXTEND: 'suppress-warning'
    })

    const Foo = extend({
      name: 'Foo',
      template: '<div>original</div>'
    })

    const FooStub = { template: '<div>stubbed</div>' }

    const Component = {
      components: { NamedAsNotFoo: Foo },
      template: '<named-as-not-foo />'
    }

    const wrapper = mount(Component, {
      global: {
        stubs: {
          Foo: FooStub
        }
      }
    })

    expect(wrapper.html()).toBe('<div>stubbed</div>')
  })

  it('correctly uses stubs when stub is legacy component', () => {
    configureCompat({
      MODE: 3,
      GLOBAL_EXTEND: 'suppress-warning',
      GLOBAL_MOUNT: 'suppress-warning'
    })

    const Foo = {
      name: 'Foo',
      template: '<div>original</div>'
    }

    const FooStub = extend({ template: '<div>stubbed</div>' })

    const Component = {
      components: { NamedAsNotFoo: Foo },
      template: '<named-as-not-foo />'
    }

    const wrapper = mount(Component, {
      global: {
        stubs: {
          Foo: FooStub
        }
      }
    })

    expect(wrapper.findComponent(Foo).html()).toBe('<div>stubbed</div>')
  })

  it('wrapper.vm points to correct instance when component is wrapped with Vue.extend', () => {
    const Component = extend({
      data() {
        return { foo: 'bar' }
      },
      template: '<div></div>'
    })

    const wrapper = mount(Component)

    expect(wrapper.vm.foo).toBe('bar')
  })

  it('correctly passes all props to functional component', async () => {
    configureCompat({
      MODE: 3,
      INSTANCE_LISTENERS: 'suppress-warning',
      INSTANCE_ATTRS_CLASS_STYLE: 'suppress-warning'
    })

    const FunctionalComponent = {
      functional: true,
      render(h: any, context: any) {
        return h('div', context.data, context.props.text)
      }
    }

    const onClick = vi.fn()
    const wrapper = mount(FunctionalComponent, {
      props: {
        class: 'foo',
        text: 'message',
        style: { color: 'red' },
        onClick
      }
    })
    expect(wrapper.text()).toBe('message')
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalled()
    expect(wrapper.html()).toBe(
      '<div class="foo" text="message" style="color: red;">message</div>'
    )
  })
})
