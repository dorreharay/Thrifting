const doneElem = `<div class="modal-row__checkbox">
<svg data-icon-name="icon-done" aria-hidden="true" class="g-icon"><use href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401161322-c4285dbecb#icon-done" xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401161322-c4285dbecb#icon-done"></use></svg>
</div>`

const loaderElem = `<div class="modal-row__checkbox empty">
<div class="b-posts_preloader m-gaps" data-v-cea4dd88=""><svg data-icon-name="icon-loading" aria-hidden="true" class="g-icon"><use href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401161322-c4285dbecb#icon-loading" xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401161322-c4285dbecb#icon-loading"></use></svg></div>
</div>`

const emptyElem = `<div class="modal-row__checkbox empty"></div>`

const progressSteps = {
  initialSteps: [
    {
      title: 'Fetched message data',
      elem: emptyElem,
    },
    {
      title: 'Message & Price Copied',
      elem: emptyElem,
    },
    {
      title: 'Past Buyers Added to Exclusion List',
      elem: emptyElem,
    },
    {
      title: 'Message Unsent',
      elem: loaderElem,
    },
  ],
  originationSteps: [
    {
      title: 'Message Sent',
      elem: emptyElem,
    },
    {
      title: 'Exclusion List Initialized',
      elem: emptyElem,
    },
    {
      title: 'Vault Folder Initialized',
      elem: loaderElem,
    },
  ],
}

let steps = progressSteps?.initialSteps

export const updateStepsArray = (listName = 'initialSteps') => {
  steps = progressSteps?.[listName]
}

export const updateStep = activeStep => {
  steps = steps?.map((item, index) => {
    if (index < activeStep) {
      return { ...item, elem: doneElem }
    }

    if (index === activeStep) {
      return { ...item, elem: loaderElem }
    }

    if (index < activeStep) {
      return { ...item, elem: doneElem }
    }

    if (index > activeStep) {
      return { ...item, elem: emptyElem }
    }

    return item
  })

  removeStatusWindow()

  insertStatusWindow()
}

const insertStatusWindow = () => {
  const modal = document.createElement('div')
  // modal.id = 'thrift-modal'
  modal.className = 'thrift-status'
  modal.innerHTML = `<div style="position: absolute; z-index: 1040;">
        <div
          id="thrift-close"
          role="dialog"
          aria-modal="true"
          style="display: block; padding-left: 0px;"
        >
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <span tabindex="0"></span>
            <div
              id="9j03d3vqv___BV_modal_content_"
              tabindex="-1"
              class="modal-content"
            >
              <div class="modal-heading">
                <strong>Thrifting in progress...</strong>
              </div>

              ${steps
                ?.map(
                  ({ title, elem }) =>
                    `<div class="modal-row">
                
                  ${elem}
                  <p>${title}</p>
                </div>`,
                )
                .join('\n')}
            </div>
            <span tabindex="0"></span>
          </div>
        </div>
        <div class="modal-backdrop"></div>
      </div>`

  document.body.appendChild(modal)
}

export const removeStatusWindow = () => {
  const modal = document.querySelector('.thrift-status')

  modal?.remove?.()
}

export const setSuccessMessage = () => {
  const modal = document.querySelector('.thrift-status')
  const content = modal.querySelector('.modal-content')

  const div = document.createElement('div')
  div.className = 'modal-success'
  div.innerHTML = `${doneElem} Success`

  content.replaceChildren(div)
}

export const resetSteps = (listName = 'initialSteps') => {
  steps = progressSteps?.[listName]
}
