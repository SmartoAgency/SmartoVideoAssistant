# Конфігураційний об’єкт

## Загальні параметри
| Поле                | Тип    | Опис |
|---------------------|--------|------|
| `poster`            | string | Шлях до зображення постера. |
| `play-button-video` | string | Шлях до відео, яке відтворюється при натисканні кнопки Play. |
| `authorLogo`        | string | Логотип автора/бренду. |
| `formAction`        | string | URL для обробки форми зворотного зв'язку. |
| `initial_country`        | string | Початкова країна для обробки форми зворотного зв'язку. |

---

## `openIcon`
| Поле             | Тип      | Опис |
|------------------|----------|------|
| `position`       | string   | Позиція іконки на екрані (наприклад, `center-right`). |
| `text`           | string   | Текст, що відображається на іконці. |
| `positionsFaq`   | string[] | Можливі позиції для розміщення FAQ: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `center-left`, `center-right`. |

---

## `questions[]`
Масив об'єктів, що описують кроки вікторини.

| Поле           | Тип      | Опис |
|----------------|----------|------|
| `video`        | string   | Шлях до відео, яке супроводжує питання. |
| `question`     | string   | Текст питання. |
| `answers`      | string[] | Список варіантів відповідей. |
| `orderedList`  | boolean  | (Опційно) Якщо `true`, відповіді відображаються у нумерованому списку. |

**Приклад елемента**:
```json
{
  "video": "/my/full/path/to/video/Joe-Habitat-Eng-Intro (1).mp4",
  "question": "What type of property are you looking for?",
  "answers": ["Comfort", "Business", "Premium"],
  "orderedList": true
}
