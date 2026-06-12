import '../shared/style.css'
import { renderNav } from '../shared/nav.ts'
import { renderFooter } from '../shared/footer.ts'

// All guide pages highlight the "Guides" nav item, including individual articles.
renderNav(`${import.meta.env.BASE_URL}guides/`)
renderFooter()
