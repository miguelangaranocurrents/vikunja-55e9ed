import type {Fragment, Node, Slice} from '@tiptap/pm/model'

function serializeFragment(fragment: Fragment, indent: string, lines: string[]): void {
	fragment.forEach(child => serializeNode(child, indent, lines))
}

function serializeBlockText(node: Node, indent: string, lines: string[]): void {
	let current = ''
	node.forEach(child => {
		if (child.type.name === 'hardBreak') {
			lines.push(indent + current)
			current = ''
			return
		}
		current += child.textContent
	})
	lines.push(indent + current)
}

function serializeNode(node: Node, indent: string, lines: string[]): void {
	if (node.isText) {
		if (lines.length === 0) {
			lines.push(indent + (node.text ?? ''))
		} else {
			lines[lines.length - 1] += node.text ?? ''
		}
		return
	}

	const typeName = node.type.name

	if (typeName === 'bulletList' || typeName === 'orderedList' || typeName === 'taskList') {
		let number = typeof node.attrs.start === 'number' ? node.attrs.start : 1
		node.forEach(item => {
			let marker: string
			if (typeName === 'orderedList') {
				marker = `${number++}. `
			} else if (typeName === 'taskList') {
				marker = item.attrs.checked ? '- [x] ' : '- [ ] '
			} else {
				marker = '- '
			}
			const childIndent = indent + ' '.repeat(marker.length)
			const firstLine = lines.length
			serializeNode(item, childIndent, lines)
			if (lines.length > firstLine) {
				lines[firstLine] = indent + marker + lines[firstLine].slice(childIndent.length)
			}
		})
		return
	}

	if (typeName === 'listItem' || typeName === 'taskItem' || typeName === 'blockquote') {
		serializeFragment(node.content, indent, lines)
		return
	}

	if (typeName === 'tableRow') {
		const cells: string[] = []
		node.forEach(cell => cells.push(cell.textContent))
		lines.push(indent + cells.join(' | '))
		return
	}

	serializeBlockText(node, indent, lines)
}

export function serializeSliceAsText(slice: Slice): string {
	const lines: string[] = []
	serializeFragment(slice.content, '', lines)
	return lines.join('\n')
}
