export type ArrowDirection = 'up' | 'down'

export interface LabelConfig {
	zone: string
	row: number
	rack: number
	level: number
	position: number
	arrowDirection: ArrowDirection
}

export interface RangeValue {
	from: number
	to: number
}

export interface LabelFormState {
	zone: string
	row: RangeValue
	rack: RangeValue
	level: RangeValue
	position: RangeValue
	arrowDirection: ArrowDirection
}
