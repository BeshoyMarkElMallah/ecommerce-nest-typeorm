import { Roles } from "src/utility/common/user-roles.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    @Column()
    email: string;
    @Column()
    password: string;
    @Column({type:'enum',enum:Roles,array:true,default:[Roles.USER]})
    roles: Roles[];
//     @CreateDateColumn()
//     created_at: Date;
//     @UpdateDateColumn()
//     updated_at: Date;
}
