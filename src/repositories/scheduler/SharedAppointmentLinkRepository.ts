import {
	DatabaseService,
	allAsync,
	getAsync,
	runAsync
} from '../../services/DatabaseService';
import { Service } from 'typedi';
import ISharedAppointmentLinkRepository from './interfaces/ISharedAppointmentLinkRepository';
import SharedAppointmentLinkDbModel from '../../models/database/SharedLink';

@Service()
class SharedAppointmentLinkRepository
	implements ISharedAppointmentLinkRepository
{
	constructor(private databaseService: DatabaseService) {}

	async create(
		link: SharedAppointmentLinkDbModel
	): Promise<SharedAppointmentLinkDbModel> {
		await runAsync(
			this.databaseService.getDatabase(),
			'INSERT INTO SharedAppointmentLinks (id, userId, weekViewId, expiry, permission, createDate, modifyDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[
				link.id,
				link.userId,
				link.weekViewId,
				link.expiry,
				link.permission,
				link.createDate,
				link.modifyDate
			]
		);
		return link;
	}

	async findById(id: string): Promise<SharedAppointmentLinkDbModel | null> {
		return (await getAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks WHERE id = ?',
			[id]
		)) as SharedAppointmentLinkDbModel | null;
	}

	async findAll(): Promise<SharedAppointmentLinkDbModel[]> {
		return (await allAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks',
			[]
		)) as SharedAppointmentLinkDbModel[];
	}

	async findAllById(linkId: string) {
		return (await allAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks WHERE id = ?',
			[linkId]
		)) as SharedAppointmentLinkDbModel[];
	}

	async update(
		staff: SharedAppointmentLinkDbModel
	): Promise<SharedAppointmentLinkDbModel> {
		await runAsync(
			this.databaseService.getDatabase(),
			'UPDATE SharedAppointmentLinks SET userId = ?, weekViewId = ?, expiry = ?, permission = ?, createDate = ?, modifyDate = ? WHERE id = ?',
			[
				staff.userId,
				staff.weekViewId,
				staff.expiry,
				staff.permission,
				staff.createDate,
				staff.modifyDate,
				staff.id
			]
		);
		return staff;
	}

	async deleteById(id: string): Promise<void> {
		await runAsync(
			this.databaseService.getDatabase(),
			'DELETE FROM SharedAppointmentLinks WHERE id = ?',
			[id]
		);
	}

	async findAllByUserId(userId: string) {
		return (await allAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks WHERE userId = ?',
			[userId]
		)) as SharedAppointmentLinkDbModel[];
	}

	async createManyByWeekViewIds(
		links: SharedAppointmentLinkDbModel[]
	): Promise<SharedAppointmentLinkDbModel[]> {
		await runAsync(
			this.databaseService.getDatabase(),
			`
	  INSERT INTO SharedAppointmentLinks (id, userId, weekViewId, expiry, permission, createDate, modifyDate)
	  VALUES ${links.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
	`,
			links.flatMap((link) => [
				link.id,
				link.userId,
				link.weekViewId,
				link.expiry,
				link.permission,
				link.createDate,
				link.modifyDate
			])
		);
		return links;
	}

	async findByUserId(userId: string) {
		return (await getAsync(
			this.databaseService.getDatabase(),
			'SELECT * FROM SharedAppointmentLinks WHERE userId = ?',
			[userId]
		)) as SharedAppointmentLinkDbModel | null;
	}
}

export default SharedAppointmentLinkRepository;
