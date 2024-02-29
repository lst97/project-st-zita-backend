interface IBaseRepository<T> {
	create(item: T, userId?: string): Promise<T>;
	findById(id: string, userId?: string): Promise<T | null>;
	findAll(userId?: string): Promise<T[]>;
	update(item: T, userId?: string): Promise<T>;
	deleteById(id: string, userId?: string): Promise<void>;
}
