<?php
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
class User
{
    #[ORM\Id]
    #[ORM\Column(type: 'integer')]
    #[ORM\GeneratedValue]
    public int $user_id;

    #[ORM\Column(type: 'string')]
    public string $username;

    #[ORM\Column(type: 'string', unique: true)]
    public string $email;

    #[ORM\Column(type: 'string')]
    public string $hash;

    #[ORM\Column(type: 'string')]
    public string $salt;

    #[ORM\Column(type: 'string', nullable: true)]
    public ?string $address;

    #[ORM\Column(type: 'string', nullable: true)]
    public ?string $phone;

    #[ORM\Column(type: 'datetime')]
    public DateTime $registration_date;
}
?>